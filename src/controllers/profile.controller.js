const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendError, sendSuccess } = require('../utils/response');
const {
  encryptText,
  hashValue,
  maskPassportNumber,
  normalizeValue,
} = require('../utils/crypto');

const dateOnly = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
};

const profileFullResponse = (profile) => ({
  _id: profile._id,
  userId: profile.userId,
  passportNumberMasked: profile.passportNumberMasked,
  currentNationality: profile.currentNationality,
  dateOfBirth: dateOnly(profile.dateOfBirth),
  gender: profile.gender,
  entryDate: dateOnly(profile.entryDate),
  currentResidencyType: profile.currentResidencyType,
  currentResidencyExpiryDate: dateOnly(profile.currentResidencyExpiryDate),
  address: profile.address || null,
  emergencyContact: profile.emergencyContact || null,
  profileStatus: profile.profileStatus,
  riskLevel: profile.riskLevel,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const profileCreateResponse = (profile, onboardingStatus) => ({
  _id: profile._id,
  userId: profile.userId,
  passportNumberMasked: profile.passportNumberMasked,
  currentNationality: profile.currentNationality,
  entryDate: dateOnly(profile.entryDate),
  currentResidencyType: profile.currentResidencyType,
  profileStatus: profile.profileStatus,
  onboardingStatus,
  createdAt: profile.createdAt,
});

const requiredCreateFields = [
  'passportNumber',
  'currentNationality',
  'dateOfBirth',
  'gender',
  'entryDate',
  'currentResidencyType',
];

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return sendError(
        res,
        404,
        'PROFILE_REQUIRED',
        'User must complete the digital identity profile first'
      );
    }

    return sendSuccess(res, 200, profileFullResponse(profile));
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while getting profile');
  }
};

exports.createMyProfile = async (req, res) => {
  try {
    const missingFields = requiredCreateFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Missing required profile fields', {
        missingFields,
      });
    }

    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return sendError(
        res,
        409,
        'DUPLICATE_ENTRY',
        'Profile already exists. Use PATCH /profiles/me to update it'
      );
    }

    const passportNumberHash = hashValue(req.body.passportNumber);
    const duplicatePassport = await Profile.findOne({ passportNumberHash }).select('+passportNumberHash');

    if (duplicatePassport) {
      return sendError(
        res,
        409,
        'DUPLICATE_ENTRY',
        'Passport number is already registered'
      );
    }

    const profile = await Profile.create({
      userId: req.user._id,
      passportNumberEncrypted: encryptText(req.body.passportNumber),
      passportNumberHash,
      passportNumberMasked: maskPassportNumber(req.body.passportNumber),
      currentNationality: normalizeValue(req.body.currentNationality),
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      entryDate: req.body.entryDate,
      currentResidencyType: req.body.currentResidencyType,
      currentResidencyExpiryDate: req.body.currentResidencyExpiryDate,
      address: req.body.address,
      emergencyContact: req.body.emergencyContact,
      profileStatus: 'complete',
      riskLevel: 'low',
    });

    await User.findByIdAndUpdate(req.user._id, {
      onboardingStatus: 'completed',
      nationality: normalizeValue(req.body.currentNationality),
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
    });

    return sendSuccess(res, 201, profileCreateResponse(profile, 'completed'));
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        Object.values(error.errors).map((e) => e.message).join(', ')
      );
    }

    console.error('CREATE PROFILE ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while creating profile');
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).select(
      '+passportNumberEncrypted +passportNumberHash'
    );

    if (!profile) {
      return sendError(
        res,
        404,
        'PROFILE_REQUIRED',
        'User must complete the digital identity profile first'
      );
    }

    const allowedFields = [
      'currentNationality',
      'dateOfBirth',
      'gender',
      'entryDate',
      'currentResidencyType',
      'currentResidencyExpiryDate',
      'address',
      'emergencyContact',
      'passportNumber',
    ];

    const hasAllowedUpdate = allowedFields.some((field) => req.body[field] !== undefined);
    if (!hasAllowedUpdate) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'At least one editable profile field is required');
    }

    if (req.body.passportNumber) {
      const passportNumberHash = hashValue(req.body.passportNumber);

      if (passportNumberHash !== profile.passportNumberHash) {
        const duplicatePassport = await Profile.findOne({
          passportNumberHash,
          _id: { $ne: profile._id },
        }).select('+passportNumberHash');

        if (duplicatePassport) {
          return sendError(
            res,
            409,
            'DUPLICATE_ENTRY',
            'Passport number is already registered'
          );
        }
      }

      profile.passportNumberEncrypted = encryptText(req.body.passportNumber);
      profile.passportNumberHash = passportNumberHash;
      profile.passportNumberMasked = maskPassportNumber(req.body.passportNumber);
    }

    if (req.body.currentNationality !== undefined) {
      profile.currentNationality = normalizeValue(req.body.currentNationality);
    }
    if (req.body.dateOfBirth !== undefined) profile.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) profile.gender = req.body.gender;
    if (req.body.entryDate !== undefined) profile.entryDate = req.body.entryDate;
    if (req.body.currentResidencyType !== undefined) {
      profile.currentResidencyType = req.body.currentResidencyType;
    }
    if (req.body.currentResidencyExpiryDate !== undefined) {
      profile.currentResidencyExpiryDate = req.body.currentResidencyExpiryDate;
    }

    if (req.body.address !== undefined) {
      profile.address = {
        ...(profile.address ? profile.address.toObject() : {}),
        ...req.body.address,
      };
    }

    if (req.body.emergencyContact !== undefined) {
      profile.emergencyContact = {
        ...(profile.emergencyContact ? profile.emergencyContact.toObject() : {}),
        ...req.body.emergencyContact,
      };
    }

    await profile.save();

    const userUpdates = {};
    if (req.body.currentNationality !== undefined) {
      userUpdates.nationality = normalizeValue(req.body.currentNationality);
    }
    if (req.body.dateOfBirth !== undefined) userUpdates.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) userUpdates.gender = req.body.gender;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    return sendSuccess(res, 200, {
      _id: profile._id,
      passportNumberMasked: profile.passportNumberMasked,
      currentNationality: profile.currentNationality,
      dateOfBirth: dateOnly(profile.dateOfBirth),
      gender: profile.gender,
      entryDate: dateOnly(profile.entryDate),
      currentResidencyType: profile.currentResidencyType,
      currentResidencyExpiryDate: dateOnly(profile.currentResidencyExpiryDate),
      address: profile.address || null,
      emergencyContact: profile.emergencyContact || null,
      profileStatus: profile.profileStatus,
      riskLevel: profile.riskLevel,
      updatedAt: profile.updatedAt,
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

    console.error('UPDATE PROFILE ERROR:', error);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Server error while updating profile');
  }
};
