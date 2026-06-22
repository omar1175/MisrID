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
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
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
      default: 'ar',
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

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
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

    isVerified: {
      type: Boolean,
      default: false,
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationOTPExpires;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);