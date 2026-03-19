const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  name: { type: String, required: true },
  step_type: { type: String, required: true, enum: ['approval', 'task', 'notification', 'condition', 'completed'] },
  order: { type: Number, default: 0 },
  metadata: { type: Object, default: {} }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Step', stepSchema);
