const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Auth required, but email verification is not required here.
router.post('/otp/send', protect, authController.sendEmailOTP);
router.post('/otp/verify', protect, authController.verifyEmailOTP);
router.post('/logout', protect, authController.logout);

module.exports = router;
