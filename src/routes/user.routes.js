const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadProfileImage } = require('../middlewares/upload.middleware');

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateMe);

router.post(
  '/me/profile-image',
  protect,
  uploadProfileImage.single('image'),
  userController.uploadProfileImage
);

module.exports = router;