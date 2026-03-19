const router = require('express').Router();
const Workflow = require('../models/Workflow');

router.post('/api/workflows', async (req, res) => {
  try {
    const { name, nodes, edges } = req.body;

    // Map React Flow nodes/edges to your Schema
    const steps = nodes.map(node => ({
      id: node.id,
      name: node.data.label,
      stepType: node.type || 'task',
      // Rules are derived from edges connected to this node
      rules: edges
        .filter(edge => edge.source === node.id)
        .map((edge, index) => ({
          priority: index + 1,
          condition: edge.data?.condition || "DEFAULT", // Logic from Sidebar
          nextStepId: edge.target
        }))
    }));

    const newWorkflow = new Workflow({
      name,
      steps,
      startStepId: nodes[0]?.id, // Usually the first node
      inputSchema: {} // You can add a builder for this later
    });

    await newWorkflow.save();
    res.status(201).json(newWorkflow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});