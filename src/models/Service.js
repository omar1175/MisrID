const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  estimatedDays: { type: Number, required: true },
  governmentFee: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  currency: { type: String, default: 'EGP' }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
