const mongoose = require('mongoose');
require('dotenv').config({path: './backend/.env'});

const ExecutionInfoSchema = new mongoose.Schema({
    workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    data: { type: Object, default: {} },
    status: { type: String, required: true },
    current_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' }
});

const StepInfoSchema = new mongoose.Schema({
    workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    name: { type: String, required: true },
    step_type: { type: String, required: true },
    metadata: { type: Object, default: {} } // For storing assignee emails, forms, etc.
});

const Execution = mongoose.models.Execution || mongoose.model('Execution', ExecutionInfoSchema);
const Step = mongoose.models.Step || mongoose.model('Step', StepInfoSchema);

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const executions = await Execution.find({ status: 'paused' }).populate('current_step_id').lean();
    console.log("PAUSED EXECUTIONS:", JSON.stringify(executions, null, 2));
    process.exit(0);
}

run();
