const multer = require('multer');

const storage = multer.memoryStorage();

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const isValidImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  const hex = buffer.subarray(0, 4).toString('hex');

  // JPEG: FF D8 FF
  if (hex.startsWith('ffd8ff')) return true;
  // PNG: 89 50 4E 47
  if (hex.startsWith('89504e47')) return true;
  // WEBP: 52 49 46 46 (RIFF) - check bytes 8-12 for "WEBP"
  if (hex.startsWith('52494646') && buffer.subarray(8, 12).toString() === 'WEBP') return true;

  return false;
};

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = { upload, isValidImageBuffer };