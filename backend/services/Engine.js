const jexl = require('jexl');

async function evaluateRules(currentStep, inputData) {
  // 1. Sort rules by priority
  const sortedRules = currentStep.rules.sort((a, b) => a.priority - b.priority);

  for (let rule of sortedRules) {
    // 2. Handle the DEFAULT rule
    if (rule.condition === "DEFAULT") return rule.nextStepId;

    // 3. Evaluate the logical expression (e.g., "amount > 100")
    const isMatch = await jexl.eval(rule.condition, inputData);
    
    if (isMatch) {
      return rule.nextStepId; // Found our path!
    }
  }
  
  return null; // End of workflow if no rules match
}