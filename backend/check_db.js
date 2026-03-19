const mongoose = require('mongoose');
const Workflow = require('./models/Workflow');
const Step = require('./models/Step');
const Rule = require('./models/Rule');
require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const workflows = await Workflow.find({});
  for (let wf of workflows) {
    console.log(`Workflow: ${wf.name} (ID: ${wf._id}) start_step_id: ${wf.start_step_id}`);
    const steps = await Step.find({ workflow_id: wf._id }).sort({ order: 1 });
    for (let st of steps) {
      console.log(`  Step: ${st.name} [${st._id}]`);
      const rules = await Rule.find({ step_id: st._id }).sort({ priority: 1 });
      for (let r of rules) {
        console.log(`    Rule ${r.priority}: condition="${r.condition}" -> next=${r.next_step_id}`);
      }
    }
  }
  process.exit(0);
}
check();
