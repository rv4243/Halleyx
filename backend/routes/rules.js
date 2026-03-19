const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

// PUT /rules/:id - Update rule
router.put('/:id', async (req, res) => {
    try {
        const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!rule) return res.status(404).json({ error: 'Rule not found' });
        res.json(rule);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /rules/:id - Delete rule
router.delete('/:id', async (req, res) => {
    try {
        const rule = await Rule.findByIdAndDelete(req.params.id);
        if (!rule) return res.status(404).json({ error: 'Rule not found' });
        res.json({ message: 'Rule deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
