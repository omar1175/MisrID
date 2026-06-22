const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { isValidImageBuffer } = require('../middlewares/upload.middleware');

// GET /users/me
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('GET ME ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    });
  }
};

// PATCH /users/me
exports.updateMe = async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'nationality',
      'dateOfBirth',
      'gender',
      'preferredLanguage',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided to update',
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }
    console.error('UPDATE ME ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

// POST /users/me/profile-image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    if (!isValidImageBuffer(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file. File content does not match an allowed image type.',
      });
    }

    const user = await User.findById(req.user._id).select('+profileImagePublicId');
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      } catch (err) {
        console.error('Failed to delete old Cloudinary image:', err.message);
      }
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gov-services/profiles',
          public_id: `user_${user._id}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.profileImageUrl = uploadResult.secure_url;
    user.profileImagePublicId = uploadResult.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error('UPLOAD PROFILE IMAGE ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading profile image',
    });
  }
};

// POST /users/me/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password +refreshTokens');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    user.refreshTokens = []; 
    user.isLoggedIn = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(', '),
      });
    }
    console.error('CHANGE PASSWORD ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password',
    });
  }
};

// GET /users (Admin only) — pagination + filtering
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, search, nationality } = req.query;

    const filter = {};

    if (status) filter.accountStatus = status;
    if (nationality) filter.nationality = nationality;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};

// PATCH /users/:userId/status (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'suspended', 'deleted'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const user = await User.findById(userId).select('+refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.accountStatus = status;
    user.statusReason = reason || null;

    if (status !== 'active') {
      user.refreshTokens = [];
      user.isLoggedIn = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }
    console.error('UPDATE USER STATUS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user status',
    });
  }
};