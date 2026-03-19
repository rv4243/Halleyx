const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflow_version: { type: Number, required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'failed', 'cancelled', 'paused', 'resuming_approval'], default: 'in_progress' },
  data: { type: Object, default: {} },
  current_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
  steps_completed: [{
    step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
    status: { type: String, enum: ['completed', 'failed', 'skipped'] }
  }],
  retries: { type: Number, default: 0 },
  triggered_by: { type: String, required: true }, // e.g., user ID
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date, default: null }
});

module.exports = mongoose.model('Execution', executionSchema);
