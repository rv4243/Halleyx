const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');

// POST /workflows - Create workflow
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
    console.log("ROUTE DB STATE:", mongoose.connection.readyState);

    try {
        const workflow = new Workflow(req.body);
        await workflow.save();
        res.status(201).json(workflow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /workflows - List workflows (pagination & search)
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        
        const filter = {};
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        const workflowsDocs = await Workflow.find(filter).skip(skip).limit(limit).lean();
        
        // Dynamically compute the number of steps for each workflow
        const workflows = await Promise.all(workflowsDocs.map(async (wf) => {
            const stepsCount = await Step.countDocuments({ workflow_id: wf._id });
            return { ...wf, stepsCount };
        }));

        const total = await Workflow.countDocuments(filter);
        
        res.json({ workflows, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /workflows/:id - Get workflow details including steps & rules
router.get('/:id', async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
        
        const steps = await Step.find({ workflow_id: workflow._id });
        const stepIds = steps.map(s => s._id);
        const rules = await Rule.find({ step_id: { $in: stepIds } });
        
        res.json({ workflow, steps, rules });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /workflows/:id - Update workflow (creates new version)
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        // Remove version from updateData to prevent MongoDB conflict with $inc
        delete updateData.version;
        
        // Technically, "creates new version" might mean duplicating the document, 
        // but for simplicity we'll increment the version counter on update.
        const workflow = await Workflow.findByIdAndUpdate(
            req.params.id, 
            { ...updateData, $inc: { version: 1 } }, 
            { new: true, runValidators: true }
        );
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
        res.json(workflow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /workflows/:id/duplicate - Duplicate a workflow and all its steps/rules
router.post('/:id/duplicate', async (req, res) => {
    try {
        const originalWorkflow = await Workflow.findById(req.params.id);
        if (!originalWorkflow) return res.status(404).json({ error: 'Workflow not found' });

        // 1. Create duplicate workflow
        const newWorkflow = new Workflow({
            name: `${originalWorkflow.name} (Copy)`,
            version: 1,
            is_active: originalWorkflow.is_active,
            input_schema: originalWorkflow.input_schema
        });
        await newWorkflow.save();

        // 2. Fetch original steps
        const originalSteps = await Step.find({ workflow_id: originalWorkflow._id });
        const stepIdMap = {};

        // 3. Duplicate steps
        for (const step of originalSteps) {
            const newStep = new Step({
                workflow_id: newWorkflow._id,
                name: step.name,
                step_type: step.step_type,
                order: step.order,
                metadata: step.metadata
            });
            await newStep.save();
            stepIdMap[step._id.toString()] = newStep._id;
        }

        // 4. Duplicate rules using mapped IDs
        for (const step of originalSteps) {
            const rules = await Rule.find({ step_id: step._id });
            for (const rule of rules) {
                const newNextStepId = rule.next_step_id ? stepIdMap[rule.next_step_id.toString()] : null;
                const newRule = new Rule({
                    step_id: stepIdMap[step._id.toString()],
                    name: rule.name,
                    type: rule.type,
                    priority: rule.priority,
                    condition: rule.condition,
                    next_step_id: newNextStepId
                });
                await newRule.save();
            }
        }

        // 5. Update start_step_id on new workflow
        if (originalWorkflow.start_step_id && stepIdMap[originalWorkflow.start_step_id.toString()]) {
            newWorkflow.start_step_id = stepIdMap[originalWorkflow.start_step_id.toString()];
            await newWorkflow.save();
        }

        res.status(201).json(newWorkflow);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /workflows/:id - Delete workflow
router.delete('/:id', async (req, res) => {
    try {
        const workflow = await Workflow.findByIdAndDelete(req.params.id);
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
        
        // Also delete related steps and rules
        const steps = await Step.find({ workflow_id: req.params.id });
        const stepIds = steps.map(s => s._id);
        await Step.deleteMany({ workflow_id: req.params.id });
        await Rule.deleteMany({ step_id: { $in: stepIds } });
        
        res.json({ message: 'Workflow and associated data deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /workflows/:workflow_id/steps - Add step
router.post('/:workflow_id/steps', async (req, res) => {
    try {
        const step = new Step({ ...req.body, workflow_id: req.params.workflow_id });
        await step.save();
        res.status(201).json(step);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /workflows/:workflow_id/steps - List steps for workflow
router.get('/:workflow_id/steps', async (req, res) => {
    try {
        const steps = await Step.find({ workflow_id: req.params.workflow_id }).sort('order');
        res.json(steps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
