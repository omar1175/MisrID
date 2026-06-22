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

// Helper: build tokens + persist refresh token on user + mark logged in
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

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      nationality,
      dateOfBirth,
      gender,
      preferredLanguage,
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email, phoneNumber and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      nationality,
      dateOfBirth,
      gender,
      preferredLanguage,
    });

    const otp = generateOTP();
    user.emailVerificationOTP = hashToken(otp);
    user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      await sendVerificationOTP(user.email, otp, user.firstName);
    } catch (emailError) {
      console.error('OTP EMAIL SEND ERROR:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// POST /auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationOTP +emailVerificationOTPExpires +refreshTokens'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified',
      });
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired, please request a new one',
      });
    }

    if (user.emailVerificationOTP !== hashToken(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;

    const { accessToken, refreshToken } = await issueTokens(user);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('VERIFY OTP ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
    });
  }
};

// POST /auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified',
      });
    }

    const otp = generateOTP();
    user.emailVerificationOTP = hashToken(otp);
    user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationOTP(user.email, otp, user.firstName);
    } catch (emailError) {
      console.error('OTP EMAIL SEND ERROR:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code resent successfully',
    });
  } catch (error) {
    console.error('RESEND OTP ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
    });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +refreshTokens'
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your email with the OTP sent to you.',
      });
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
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// POST /auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not recognized',
      });
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

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
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
    });
  }
};

// POST /auth/logout  (protected)
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshTokens');
    const { refreshToken } = req.body;

    if (user) {
      if (refreshToken) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
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
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond success to avoid leaking which emails exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error('EMAIL SEND ERROR:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during forgot password',
    });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and newPassword are required',
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // invalidate old sessions
    user.isLoggedIn = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
  }
};