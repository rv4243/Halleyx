const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
  execution_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', required: true },
  step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', required: true },
  step_name: { type: String, required: true },
  step_type: { type: String, required: true },
  input_data: { type: Object, default: {} },
  evaluated_rules: [{
    rule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' },
    condition: { type: String },
    result: { type: Boolean }
  }],
  selected_rule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule' },
  selected_next_step: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
  status: { type: String, enum: ['in_progress', 'completed', 'failed', 'pending_approval'], required: true },
  approver_id: { type: String, default: null },
  error_message: { type: String, default: null },
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date, default: null }
});

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
