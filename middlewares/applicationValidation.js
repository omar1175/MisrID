const { body, param, query, validationResult } = require('express-validator');

// Middleware to catch validation errors and return standard platform error format
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: errors.array().map(err => ({ field: err.path, message: err.msg }))
      }
    });
  }
  next();
};

// Validate request body when creating a new application
exports.validateCreateApplication = [
  body('serviceId').isMongoId().withMessage('Service ID must be a valid MongoDB ObjectId'),
  body('notes').optional().isString(),
  handleValidationErrors
];

// Validate request body when updating an application
exports.validateUpdateApplication = [
  param('applicationId').isMongoId().withMessage('Invalid Application ID'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  handleValidationErrors
];

// Validate parameters and body when cancelling an application
exports.validateCancelApplication = [
  param('applicationId').isMongoId().withMessage('Invalid Application ID'),
  body('reason').notEmpty().withMessage('Reason for cancellation is required'),
  handleValidationErrors
];