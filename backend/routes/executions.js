const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');

// POST /workflows/:workflow_id/execute - Start workflow execution
// Note: We'll add this to the workflows router in a full production app, 
// or keep it here depending on prefix. For the user's API spec: POST /workflows/:workflow_id/execute
// I am exposing it here, but typically you'd mount this appropriately in index.js.
router.post('/start/:workflow_id', async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.workflow_id);
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

        const execution = new Execution({
            workflow_id: workflow._id,
            workflow_version: workflow.version,
            data: req.body.data || {},
            current_step_id: workflow.start_step_id,
            triggered_by: req.body.triggered_by || 'system'
        });

        await execution.save();
        res.status(201).json(execution);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /executions/:id - Get execution status & logs
router.get('/:id', async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id).populate('current_step_id', 'name');
        if (!execution) return res.status(404).json({ error: 'Execution not found' });

        const logs = await ExecutionLog.find({ execution_id: execution._id })
                                        .populate('step_id', 'name')
                                        .sort('started_at');
        res.json({ execution, logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /executions/:id/cancel - Cancel execution
router.post('/:id/cancel', async (req, res) => {
    try {
        const execution = await Execution.findByIdAndUpdate(
            req.params.id, 
            { status: 'cancelled', ended_at: new Date() },
            { new: true }
        );
        if (!execution) return res.status(404).json({ error: 'Execution not found' });
        res.json(execution);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /executions/:id/retry - Retry failed step
router.post('/:id/retry', async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
        if (!execution) return res.status(404).json({ error: 'Execution not found' });

        if (execution.status !== 'failed') {
            return res.status(400).json({ error: 'Can only retry failed executions' });
        }

        execution.status = 'in_progress';
        execution.retries += 1;
        execution.ended_at = null;
        await execution.save();

        res.json(execution);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
