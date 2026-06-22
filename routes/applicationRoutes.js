const express = require('express');
const router = express.Router();
const appController = require('../controllers/applicationController');
const { validateCreateApplication, validateCancelApplication, validateUpdateApplication } = require('../middlewares/applicationValidation');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

//All application endpoints require an authenticated user
router.use(protect);

// Base path: /v1/applications
router.post('/', validateCreateApplication, appController.createApplication);
router.get('/', appController.getUserApplications);

// Admin-only global application retrieval
router.get('/admin/all', isAdmin,appController.getAdminApplications);

// Resource specific routes
router.get('/:applicationId', appController.getApplicationById);
router.patch('/:applicationId', validateUpdateApplication, appController.updateApplication);
router.patch('/:applicationId/cancel', validateCancelApplication, appController.cancelApplication);

module.exports = router;
