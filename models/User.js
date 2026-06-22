const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    nationality: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    preferredLanguage: {
      type: String,
      enum: ['ar', 'en'],
      default: 'en',
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
      select: false,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    statusReason: {
      type: String,
      default: null,
    },
    roles: {
      type: [String],
      enum: ['foreigner', 'reviewer', 'admin', 'super_admin'],
      default: ['foreigner'],
    },
    adminProfile: {
      department: String,
      adminLevel: {
        type: String,
        enum: ['reviewer', 'admin', 'super_admin'],
      },
      permissions: [String],
    },
    onboardingStatus: {
      type: String,
      enum: ['profile_required', 'completed'],
      default: 'profile_required',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    emailVerificationOTP: {
      type: String,
      select: false,
    },
    emailVerificationOTPExpires: {
      type: Date,
      select: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  return next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationOTPExpires;
  delete obj.profileImagePublicId;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
