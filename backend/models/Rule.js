const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  priority: { type: Number, required: true },
  condition: { type: String, required: true },
  condition_json: { type: Object },
  next_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Rule', ruleSchema);
