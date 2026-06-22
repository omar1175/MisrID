const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  generateOTP,
  hashToken,
} = require('../utils/token');
const { sendPasswordResetEmail, sendVerificationOTP } = require('../utils/email');

const OTP_EXPIRES_IN_SECONDS = 10 * 60;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const sendError = (res, statusCode, code, message, details) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
};

const validationDetails = (error) => {
  if (!error.errors) return undefined;
  return Object.values(error.errors).map((item) => ({
    field: item.path,
    message: item.message,
  }));
};

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  user.isLoggedIn = true;
  user.lastLoginAt = new Date();
  await user.save();

  return { accessToken, refreshToken };
};

const createAndSendEmailOTP = async (user) => {
  const otp = generateOTP();

  user.emailVerificationOTP = hashToken(otp);
  user.emailVerificationOTPExpires = new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000);
  await user.save();

  await sendVerificationOTP(user.email, otp, user.firstName);

  return otp;
};

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, preferredLanguage } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'firstName, lastName, email, phoneNumber and password are required'
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phoneNumber }],
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? 'email' : 'phoneNumber';
      return sendError(res, 409, 'DUPLICATE_ENTRY', `${field} already registered`);
    }

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phoneNumber,
      passwordHash: password,
      preferredLanguage,
      roles: ['foreigner'],
      accountStatus: 'active',
      onboardingStatus: 'profile_required',
      emailVerified: false,
    });

    let verificationEmailSent = true;
    try {
      await createAndSendEmailOTP(user);
    } catch (emailError) {
      verificationEmailSent = false;
      console.error('EMAIL OTP SEND ERROR:', emailError);
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    return res.status(201).json({
      success: true,
      message: verificationEmailSent
        ? 'Registration successful. Please check your email for the verification code.'
        : 'Registration successful. Verification email was not sent, please request a new OTP.',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid input data', validationDetails(error));
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return sendError(res, 409, 'DUPLICATE_ENTRY', `${field} already exists`);
    }

    console.error('REGISTER ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during registration');
  }
};

// POST /auth/otp/send
exports.sendEmailOTP = async (req, res) => {
  try {
    const bodyEmail = req.body?.email ? normalizeEmail(req.body.email) : null;

    if (bodyEmail && bodyEmail !== req.user.email) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Email does not match the authenticated user');
    }

    const user = await User.findById(req.user._id).select(
      '+emailVerificationOTP +emailVerificationOTPExpires'
    );

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    if (user.emailVerified) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Email is already verified');
    }

    await createAndSendEmailOTP(user);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        expiresInSeconds: OTP_EXPIRES_IN_SECONDS,
      },
    });
  } catch (error) {
    console.error('SEND EMAIL OTP ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while sending OTP');
  }
};

// POST /auth/otp/verify
exports.verifyEmailOTP = async (req, res) => {
  try {
    const bodyEmail = req.body?.email ? normalizeEmail(req.body.email) : null;
    const otpCode = req.body?.otpCode || req.body?.otp;

    if (!otpCode) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'otpCode is required');
    }

    if (bodyEmail && bodyEmail !== req.user.email) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Email does not match the authenticated user');
    }

    const user = await User.findById(req.user._id).select(
      '+emailVerificationOTP +emailVerificationOTPExpires'
    );

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        data: {
          emailVerified: true,
          verifiedAt: user.emailVerifiedAt,
        },
      });
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires.getTime() < Date.now()
    ) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'OTP has expired, please request a new one');
    }

    if (user.emailVerificationOTP !== hashToken(otpCode)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid OTP');
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        emailVerified: true,
        verifiedAt: user.emailVerifiedAt,
      },
    });
  } catch (error) {
    console.error('VERIFY EMAIL OTP ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during OTP verification');
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Email and password are required');
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select(
      '+passwordHash +refreshTokens'
    );

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    if (user.accountStatus !== 'active') {
      return sendError(res, 403, 'FORBIDDEN', 'Account is not active');
    }

    if (!user.emailVerified) {
      return sendError(
        res,
        403,
        'EMAIL_NOT_VERIFIED',
        'Email address must be verified before login'
      );
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    return res.status(200).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during login');
  }
};

// POST /auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Refresh token not recognized');
    }

    if (user.accountStatus !== 'active') {
      return sendError(res, 403, 'FORBIDDEN', 'Account is not active');
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('REFRESH TOKEN ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during token refresh');
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');

    if (user) {
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      } else {
        user.refreshTokens = [];
      }

      if (user.refreshTokens.length === 0) {
        user.isLoggedIn = false;
      }

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('LOGOUT ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during logout');
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Email is required');
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select(
      '+passwordResetToken +passwordResetExpires'
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error('PASSWORD RESET EMAIL SEND ERROR:', emailError);
      return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to send password reset email');
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during forgot password');
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Token and newPassword are required');
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpires +refreshTokens');

    if (!user) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Token is invalid or has expired');
    }

    user.passwordHash = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    user.isLoggedIn = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid input data', validationDetails(error));
    }

    console.error('RESET PASSWORD ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during password reset');
  }
};
