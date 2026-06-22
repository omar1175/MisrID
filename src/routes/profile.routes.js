const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect, requireEmailVerified } = require('../middlewares/auth.middleware');

router.get('/me', protect, requireEmailVerified, profileController.getMyProfile);
router.post('/me', protect, requireEmailVerified, profileController.createMyProfile);
router.patch('/me', protect, requireEmailVerified, profileController.updateMyProfile);

module.exports = router;
