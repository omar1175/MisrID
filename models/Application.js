const mongoose = require('mongoose');

// Schema to track the history of application status changes
const StatusHistorySchema = new mongoose.Schema({
  fromStatus: { type: String, default: null },
  toStatus: { type: String, required: true },
  changedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new mongoose.Schema({
  // Unique human-readable application number (e.g., APP-2026-123456)
  applicationNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}` 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status: { 
    type: String, 
    enum: ['pending_documents', 'under_review', 'pending_payment', 'completed', 'cancelled'], 
    default: 'pending_documents' 
  },
  currentStep: { type: String, default: 'document_upload' },
  notes: { type: String },
  // Summary updated asynchronously by the AI verification agent
  aiVerificationSummary: {
    overallStatus: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
    overallScore: { type: Number, default: 0 },
    matchedProfile: { type: Boolean, default: false },
    issuesCount: { type: Number, default: 0 },
    completedAt: { type: Date }
  },
  // Final manual decision by human supervisor
  adminReview: {
    reviewedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decision: { type: String, enum: ['approved', 'rejected', 'escalated'] },
    notes: { type: String },
    reviewedAt: { type: Date }
  },
  statusHistory: [StatusHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);

