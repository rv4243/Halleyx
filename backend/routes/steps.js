const express = require('express');
const router = express.Router();
const Step = require('../models/Step');
const Rule = require('../models/Rule');

// PUT /steps/:id - Update step
router.put('/:id', async (req, res) => {
    try {
        const step = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!step) return res.status(404).json({ error: 'Step not found' });
        res.json(step);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /steps/:id - Delete step
router.delete('/:id', async (req, res) => {
    try {
        const step = await Step.findByIdAndDelete(req.params.id);
        if (!step) return res.status(404).json({ error: 'Step not found' });
        
        // Delete related rules
        await Rule.deleteMany({ step_id: req.params.id });
        
        res.json({ message: 'Step and associated rules deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /steps/:step_id/rules - Add rule
router.post('/:step_id/rules', async (req, res) => {
    try {
        const rule = new Rule({ ...req.body, step_id: req.params.step_id });
        await rule.save();
        res.status(201).json(rule);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /steps/:step_id/rules - Clear all rules for a step (used during save sync)
router.delete('/:step_id/rules', async (req, res) => {
    try {
        await Rule.deleteMany({ step_id: req.params.step_id });
        res.json({ message: 'Rules cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /steps/:step_id/rules - List rules for step
router.get('/:step_id/rules', async (req, res) => {
    try {
        const rules = await Rule.find({ step_id: req.params.step_id }).sort({ priority: 1 });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
