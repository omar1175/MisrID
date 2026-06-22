const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { sendError, sendSuccess } = require('../utils/response');
const cloudinary = require('../config/cloudinary');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

const getPublicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  emailVerified: Boolean(user.emailVerified),
  preferredLanguage: user.preferredLanguage,
  profileImageUrl: user.profileImageUrl || null,
  accountStatus: user.accountStatus,
  roles: user.roles || ['foreigner'],
  onboardingStatus: user.onboardingStatus || 'profile_required',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.getMe = async (req, res) => {
  return sendSuccess(res, 200, getPublicUser(req.user));
};

exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'preferredLanguage'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'At least one editable field is required'
      );
    }

    if (updates.preferredLanguage && !['ar', 'en'].includes(updates.preferredLanguage)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'preferredLanguage must be either ar or en'
      );
    }

    if (updates.phoneNumber && updates.phoneNumber !== req.user.phoneNumber) {
      const existingPhone = await User.findOne({
        phoneNumber: updates.phoneNumber,
        _id: { $ne: req.user._id },
      });

      if (existingPhone) {
        return sendError(
          res,
          409,
          'DUPLICATE_ENTRY',
          'Phone number is already used by another account'
        );
      }
    }

    Object.assign(req.user, updates);
    await req.user.save();

    return sendSuccess(res, 200, {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phoneNumber: req.user.phoneNumber,
      preferredLanguage: req.user.preferredLanguage,
      updatedAt: req.user.updatedAt,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        Object.values(error.errors).map((e) => e.message).join(', ')
      );
    }

    console.error('UPDATE ME ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while updating user');
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Profile image is required',
        },
      });
    }

    const user = await User.findById(req.user._id).select('+profileImagePublicId');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Delete old image from Cloudinary if exists
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (deleteError) {
        console.error('Cloudinary delete old image error:', deleteError);
      }
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'misrid/profile-images',
      resource_type: 'image',
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });

    user.profileImageUrl = result.secure_url;
    user.profileImagePublicId = result.public_id;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error('UPLOAD PROFILE IMAGE ERROR:', error);

    if (error.message && error.message.includes('Only JPG')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image size must not exceed 2MB',
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error while uploading profile image',
      },
    });
  }
};
