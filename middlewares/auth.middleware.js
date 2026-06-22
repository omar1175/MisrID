const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

const sendError = (res, statusCode, code, message) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'UNAUTHORIZED', 'No token provided, authorization denied');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'User no longer exists');
    }

    if (user.accountStatus !== 'active') {
      return sendError(res, 403, 'FORBIDDEN', 'Account is not active');
    }

    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error during authentication');
  }
};

const requireEmailVerified = (req, res, next) => {
  if (!req.user?.emailVerified) {
    return sendError(res, 403, 'EMAIL_NOT_VERIFIED', 'Email address must be verified first');
  }

  return next();
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return sendError(res, 403, 'FORBIDDEN', 'User does not have enough permissions');
    }

    return next();
  };
};

module.exports = { protect, requireEmailVerified, authorizeRoles };
