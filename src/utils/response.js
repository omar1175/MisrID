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

const sendSuccess = (res, statusCode, data, message) => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
  });
};

module.exports = { sendError, sendSuccess };
