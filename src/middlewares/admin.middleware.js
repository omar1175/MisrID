const sendError = (res, statusCode, code, message) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

const isAdmin = (req, res, next) => {
  // Extract roles array populated by protect middleware, default to empty array if undefined
  const userRoles = req.user?.roles || [];

  // Check if the user has 'admin' or 'reviewer' in their roles list
  if (!userRoles.includes('admin') && !userRoles.includes('reviewer')) {
    return sendError(res, 403, 'FORBIDDEN', 'Access denied. Admin privileges required.');
  }

  return next();
};

module.exports = { isAdmin };