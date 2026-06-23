const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const adminUserController = require('../controllers/adminUser.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadProfileImage } = require('../middlewares/upload.middleware');
const { isAdmin, isSuperAdmin } = require('../middlewares/admin.middleware');

// User self routes
router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateMe);

router.post(
  '/me/profile-image',
  protect,
  uploadProfileImage.single('image'),
  userController.uploadProfileImage
);

// Admin-level routes (admin + super_admin + reviewer)
router.get('/', protect, isAdmin, adminUserController.getUsers);
router.patch('/:userId/status', protect, isAdmin, adminUserController.updateUserStatus);
router.patch('/:userId/roles', protect, isAdmin, adminUserController.updateUserRoles);

// Super admin only
router.patch('/:userId/admin-profile', protect, isSuperAdmin, adminUserController.updateAdminProfile);

module.exports = router;