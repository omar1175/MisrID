const Service = require('../models/Service');
const Application = require('../models/Application');

// @desc    Create a new service application
// @route   POST /v1/applications
// @access  Private (Foreigner User)

exports.createApplication = async (req, res) => {
  try {
    const { serviceId, notes } = req.body;

    const newApp = new Application({
      userId: req.user._id,
      profileId: req.user.profileId || req.user._id, 
      serviceId,
      notes,
      status: 'pending_documents',
      currentStep: 'document_upload'
    });

    // Add initial status to history logs
    newApp.statusHistory.push({
      fromStatus: null,
      toStatus: 'pending_documents',
      changedByUserId: req.user._id,
      reason: 'Application initialized by user.'
    });

    await newApp.save();

    res.status(201).json({ success: true, data: newApp });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } });
  }
};

// @desc    Get all applications belonging to the current user
// @route   GET /v1/applications
// @access  Private (Foreigner User)
exports.getUserApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { userId: req.user._id };
    
    if (status) filter.status = status;

    const items = await Application.find(filter)
      .populate('serviceId', 'serviceName estimatedDays governmentFee platformFee currency')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Newest first

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } });
  }
};

// @desc    Get detailed view of a specific application
// @route   GET /v1/applications/:applicationId
// @access  Private (User or Admin)
exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId).populate('serviceId');
    if (!app) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Application not found" } });
    }

    res.status(200).json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } });
  }
};

// @desc    Update specific fields of an application (e.g., notes)
// @route   PATCH /v1/applications/:applicationId
// @access  Private (Authorized User)
exports.updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    // Find the application first to check its current status
    const app = await Application.findById(applicationId);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Application not found" }
      });
    }

    // Prevent updates if application is already finalized
    if (app.status === 'completed' || app.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: { 
          code: "INVALID_STATUS_TRANSITION", 
          message: "Cannot update application because it is already completed or cancelled." 
        }
      });
    }

    // Update fields dynamically if provided in the request body
    if (notes !== undefined) app.notes = notes;

    // Save the updated document
    await app.save();

    res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { code: "INTERNAL_SERVER_ERROR", message: error.message } 
    });
  }
};

// @desc    Cancel an open application
// @route   PATCH /v1/applications/:applicationId/cancel
// @access  Private (User Authorized)
exports.cancelApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: "Application not found" } });
    }

    // Business rule: Cannot cancel already completed or cancelled applications
    if (app.status === 'completed' || app.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: { code: "APPLICATION_NOT_CANCELLABLE", message: "Cannot cancel application in current status." } 
      });
    }

    // Log status transition
    app.statusHistory.push({
      fromStatus: app.status,
      toStatus: 'cancelled',
      changedByUserId: req.user._id,
      reason: req.body.reason
    });

    app.status = 'cancelled';
    await app.save();

    res.status(200).json({ success: true, data: { _id: app._id, status: app.status, cancelledAt: new Date() } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } });
  }
};

// @desc    Get all applications globally (Backoffice view)
// @route   GET /v1/applications/admin/all
// @access  Private (Admin / Reviewer Only)
exports.getAdminApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const items = await Application.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('serviceId', 'serviceName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: error.message } });
  }
};