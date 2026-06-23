const User = require('../models/User');

const sendError = (res, statusCode, code, message) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};

// GET /v1/users
// Admin only — List platform users with pagination, filtering, and search
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { status, role, search } = req.query;

    const filter = {};

    if (status) filter.accountStatus = status;
    if (role) filter.roles = role;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('firstName lastName email phoneNumber accountStatus roles onboardingStatus createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: {
        items: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET USERS ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while fetching users');
  }
};

// PATCH /v1/users/:userId/status
// Admin only — Update user account status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountStatus, reason } = req.body;

    const validStatuses = ['active', 'suspended', 'deleted'];
    if (!accountStatus || !validStatuses.includes(accountStatus)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `accountStatus must be one of: ${validStatuses.join(', ')}`
      );
    }

    const user = await User.findById(userId).select('+refreshTokens');

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    user.accountStatus = accountStatus;
    user.statusReason = reason || null;

    // If suspending or deleting, revoke all sessions
    if (accountStatus !== 'active') {
      user.refreshTokens = [];
      user.isLoggedIn = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        accountStatus: user.accountStatus,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user ID');
    }
    console.error('UPDATE USER STATUS ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while updating user status');
  }
};

// PATCH /v1/users/:userId/roles
// Admin only — Replace user roles
exports.updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    const validRoles = ['foreigner', 'reviewer', 'admin', 'super_admin'];

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'roles must be a non-empty array');
    }

    const invalidRoles = roles.filter((r) => !validRoles.includes(r));
    if (invalidRoles.length > 0) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `Invalid roles: ${invalidRoles.join(', ')}. Must be one of: ${validRoles.join(', ')}`
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    user.roles = roles;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        roles: user.roles,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user ID');
    }
    console.error('UPDATE USER ROLES ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while updating user roles');
  }
};

// PATCH /v1/users/:userId/admin-profile
// Super admin only — Create or update admin profile embedded in user document
exports.updateAdminProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { department, adminLevel, permissions } = req.body;

    const validAdminLevels = ['reviewer', 'admin', 'super_admin'];

    if (!department || !adminLevel) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'department and adminLevel are required'
      );
    }

    if (!validAdminLevels.includes(adminLevel)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `adminLevel must be one of: ${validAdminLevels.join(', ')}`
      );
    }

    if (permissions && !Array.isArray(permissions)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'permissions must be an array');
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    user.adminProfile = {
      department,
      adminLevel,
      permissions: permissions || [],
    };

    // Ensure the role matching the adminLevel is in the user's roles
    if (!user.roles.includes(adminLevel)) {
      // Replace any existing admin-type role with the new one
      user.roles = user.roles.filter((r) => !['reviewer', 'admin', 'super_admin'].includes(r));
      user.roles.push(adminLevel);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        roles: user.roles,
        adminProfile: user.adminProfile,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user ID');
    }
    console.error('UPDATE ADMIN PROFILE ERROR:', error);
    return sendError(
      res,
      500,
      'INTERNAL_SERVER_ERROR',
      'Server error while updating admin profile'
    );
  }
};
