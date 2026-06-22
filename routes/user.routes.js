const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.post('/me/profile-image', upload.single('image'), userController.uploadProfileImage);
router.post('/me/change-password', userController.changePassword);

// Admin only
router.get('/', isAdmin, userController.getAllUsers);
router.patch('/:userId/status', isAdmin, userController.updateUserStatus);

module.exports = router;