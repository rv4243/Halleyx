const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  input_schema: { type: Object, default: {} },
  start_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Workflow', workflowSchema);
