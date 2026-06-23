const sendError = (res, statusCode, code, message) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

const isAdmin = (req, res, next) => {
  const userRoles = req.user?.roles || [];

  if (
    !userRoles.includes('admin') &&
    !userRoles.includes('super_admin') &&
    !userRoles.includes('reviewer')
  ) {
    return sendError(res, 403, 'FORBIDDEN', 'Access denied. Admin privileges required.');
  }

  return next();
};

const isSuperAdmin = (req, res, next) => {
  const userRoles = req.user?.roles || [];

  if (!userRoles.includes('super_admin')) {
    return sendError(res, 403, 'FORBIDDEN', 'Access denied. Super admin privileges required.');
  }

  return next();
};

module.exports = { isAdmin, isSuperAdmin };