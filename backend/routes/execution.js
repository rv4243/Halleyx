const router = require('express').Router();
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const jexl = require('jexl');
const { sendNotification } = require('../services/NotificationService');

async function runEngineLoop(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) throw new Error("Execution not found");

    const workflow = await Workflow.findById(execution.workflow_id);
    const steps = await Step.find({ workflow_id: workflow._id });
    const rulesList = await Rule.find({ step_id: { $in: steps.map(s => s._id) } }).sort({ priority: 1 });

    const rulesByStep = {};
    rulesList.forEach(r => {
      rulesByStep[r.step_id] = rulesByStep[r.step_id] || [];
      rulesByStep[r.step_id].push(r);
    });

    let currentStepId = execution.current_step_id;
    const frontendLogs = [];
    let loopCount = 0;
    const MAX_STEPS = 50;

    while (currentStepId && loopCount < MAX_STEPS) {
      loopCount++;

      const currentStep = steps.find(s => s._id.toString() === currentStepId.toString());
      if (!currentStep) break;

      // --- PAUSE CHECK (Workflow Suspension) ---
      if (currentStep.step_type === 'approval' && execution.status !== 'resuming_approval') {
          execution.status = 'paused';
          execution.current_step_id = currentStep._id;
          await execution.save();
          frontendLogs.push({
              stepId: currentStep._id,
              stepName: currentStep.name,
              decision: "Execution Paused: Waiting for Admin Approval",
              status: 'paused',
              timestamp: new Date()
          });
          return { status: 'paused', logs: frontendLogs };
      }

      if (execution.status === 'resuming_approval') {
          execution.status = 'in_progress';
      }

      let nextStepId = null;
      let decisionStr = "Workflow Finished";
      
      if (currentStep.step_type === 'notification' || currentStep.step_type === 'approval') {
        try {
            await sendNotification('email', currentStep.metadata, execution.data);
        } catch (e) {
            console.log("Mock Notification:", e.message);
        }
      }

      const stepRules = rulesByStep[currentStep._id] || [];
      const evaluatedRules = [];
      let defaultRule = null;
      let matchedRule = null;
      
      for (const rule of stepRules) {
        if (!rule.condition || rule.condition === "DEFAULT") {
            defaultRule = rule;
            continue;
        }

        let isMatch = false;
        try {
            isMatch = await jexl.eval(rule.condition, execution.data);
        } catch (err) {
            console.error("Jexl eval error:", err.message);
        }
        
        evaluatedRules.push({
            rule_id: rule._id,
            condition: rule.condition,
            result: isMatch
        });

        if (isMatch) {
            matchedRule = rule;
            break;
        }
      }

      if (!matchedRule && defaultRule) {
          evaluatedRules.push({
              rule_id: defaultRule._id,
              condition: 'DEFAULT',
              result: true
          });
          matchedRule = defaultRule;
      }

      if (matchedRule) {
          nextStepId = matchedRule.next_step_id;
          const nextStep = steps.find(s => s._id.toString() === nextStepId?.toString());
          decisionStr = nextStepId ? `Moving to ${nextStep ? nextStep.name : nextStepId}` : "Workflow Finished";
      }

      const logEntry = new ExecutionLog({
          execution_id: execution._id,
          step_id: currentStep._id,
          step_name: currentStep.name,
          step_type: currentStep.step_type,
          input_data: execution.data,
          evaluated_rules: evaluatedRules,
          selected_next_step: nextStepId || null,
          status: 'completed'
      });
      await logEntry.save();

      frontendLogs.push({
          stepId: currentStep._id,
          stepName: currentStep.name,
          decision: decisionStr,
          status: 'completed',
          timestamp: logEntry.started_at
      });

      currentStepId = nextStepId || null;
      execution.current_step_id = currentStepId;
      execution.steps_completed.push({ step_id: currentStep._id, status: 'completed' });
    }

    if (loopCount >= MAX_STEPS) {
        throw new Error("Execution halted: Maximum step limit reached (possible infinite loop).");
    }

    execution.status = 'completed';
    execution.ended_at = new Date();
    execution.current_step_id = null;
    await execution.save();
    
    return { status: execution.status, logs: frontendLogs };
}

/**
 * ROUTE: Start a New Execution
 * POST /api/execute/:workflowId
 */
router.post('/api/execute/:workflowId', async (req, res) => {
  try {
    const inputData = req.body.inputData || {};
    const workflow = await Workflow.findById(req.params.workflowId);

    if (!workflow) return res.status(404).json({ error: "Workflow not found" });
    if (!workflow.start_step_id) return res.status(400).json({ error: "Workflow has no start step" });

    // 1. Initialize the Execution document
    const execution = new Execution({
      workflow_id: workflow._id,
      workflow_version: workflow.version,
      data: inputData,
      status: 'in_progress',
      current_step_id: workflow.start_step_id,
      triggered_by: 'system'
    });
    await execution.save();

    // 2. Run Engine
    const result = await runEngineLoop(execution._id);
    res.json(result);

  } catch (err) {
    console.error("EXECUTION FATAL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Get Pending Approvals (Admin/User)
router.get('/api/admin/executions/pending', async (req, res) => {
    try {
        const executions = await Execution.find({ status: 'paused' })
            .sort({ started_at: -1 })
            .populate('workflow_id', 'name')
            .populate('current_step_id', 'name metadata')
            .lean();

        let formatted = executions.map(ex => ({
            id: ex._id,
            workflowName: ex.workflow_id ? ex.workflow_id.name : 'Unknown',
            stepName: ex.current_step_id ? ex.current_step_id.name : 'Unknown Step',
            assigneeEmail: ex.current_step_id && ex.current_step_id.metadata ? ex.current_step_id.metadata.assignee_email : null,
            data: ex.data,
            startedAt: ex.started_at
        }));

        if (req.query.email) {
            const searchEmail = req.query.email.toLowerCase();
            
            // Master Admin Override
            if (searchEmail !== 'admin@company.com' && searchEmail !== 'admin') {
                formatted = formatted.filter(ex => {
                    return ex.assigneeEmail && ex.assigneeEmail.toLowerCase() === searchEmail;
                });
            }
        }
        
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: Admin Approve
router.post('/api/admin/executions/:id/approve', async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
        if (!execution || execution.status !== 'paused') {
            return res.status(400).json({ error: "Execution is not pending approval." });
        }
        
        // Inject approval decision into data
        execution.data = { ...execution.data, approval_decision: 'Approved' };
        execution.status = 'resuming_approval';
        await execution.save();

        // Resume engine
        const result = await runEngineLoop(execution._id);
        res.json({ message: "Approved successfully", result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: Admin Reject
router.post('/api/admin/executions/:id/reject', async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
        if (!execution || execution.status !== 'paused') {
            return res.status(400).json({ error: "Execution is not pending approval." });
        }
        
        execution.data = { ...execution.data, approval_decision: 'Rejected' };
        execution.status = 'failed';
        execution.ended_at = new Date();
        await execution.save();

        res.json({ message: "Rejected successfully", status: "failed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: Get All Executions (Audit Log)
router.get('/api/executions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const executions = await Execution.find()
            .sort({ started_at: -1 })
            .limit(limit)
            .populate('workflow_id', 'name')
            .lean();

        const formatted = executions.map(ex => ({
            id: ex._id,
            workflowName: ex.workflow_id ? ex.workflow_id.name : 'Deleted/Unknown',
            version: ex.workflow_version,
            status: ex.status.toUpperCase(),
            startedBy: ex.triggered_by || 'System',
            startTime: ex.started_at,
            endTime: ex.ended_at
        }));
        
        res.json(formatted);
    } catch (err) {
        console.error("Audit Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;