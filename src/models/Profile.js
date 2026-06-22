const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true, default: 'EG' },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    street: { type: String, trim: true },
    buildingNo: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    passportNumberEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    passportNumberHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    passportNumberMasked: {
      type: String,
      required: true,
    },

    currentNationality: {
      type: String,
      required: [true, 'Current nationality is required'],
      trim: true,
      uppercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    entryDate: {
      type: Date,
      required: [true, 'Entry date is required'],
    },
    currentResidencyType: {
      type: String,
      required: [true, 'Current residency type is required'],
      trim: true,
    },
    currentResidencyExpiryDate: {
      type: Date,
    },

    address: addressSchema,
    emergencyContact: emergencyContactSchema,

    profileStatus: {
      type: String,
      enum: ['incomplete', 'complete'],
      default: 'complete',
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

profileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passportNumberEncrypted;
  delete obj.passportNumberHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Profile', profileSchema);
