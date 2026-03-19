import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import jexl from 'jexl';

const RuleRow = ({ rule, onUpdate, onDelete, availableSteps, testData }) => {
  const [isValid, setIsValid] = useState(null);

  const testRule = async (condition, data) => {
    if (!condition || condition === "DEFAULT") {
      setIsValid(true);
      return;
    }
    try {
      await jexl.eval(condition, data || {});
      setIsValid(true);
    } catch (err) {
      setIsValid(false);
    }
  };

  // Live validate as test payload changes
  useEffect(() => {
    testRule(rule.condition, testData);
  }, [testData, rule.condition]);

  return (
    <div className={`grid grid-cols-[50px_1fr_130px_36px] gap-2 p-2 items-center transition-colors hover:bg-blue-50/30 ${isValid === false ? 'bg-red-50/30' : ''}`}>
      
      {/* Priority */}
      <div className="text-[11px] font-mono font-black text-gray-500 text-center select-none">
        {rule.priority}
      </div>
      
      {/* Condition */}
      <div className="relative group">
          <input
            className={`w-full p-2 border rounded-lg text-[11px] font-mono outline-none transition-all shadow-sm ${
              isValid === false 
                ? 'border-red-300 bg-white text-red-700 focus:ring-2 focus:ring-red-100' 
                : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50'
            }`}
            placeholder="e.g. amount > 100"
            value={rule.condition}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate({ ...rule, condition: val });
              testRule(val, testData); 
            }}
          />
          {isValid === false && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-xl pointer-events-none whitespace-nowrap">
                  Invalid syntax or unknown variable
              </div>
          )}
      </div>

      {/* Next Step */}
      <div>
          <select 
            className="w-full p-2 pl-1 border rounded-lg text-xs bg-white border-gray-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 truncate font-semibold text-gray-700 shadow-sm"
            value={rule.nextStepId || ''}
            onChange={(e) => onUpdate({ ...rule, nextStepId: e.target.value })}
            title={rule.nextStepId ? availableSteps.find(s => s.id === rule.nextStepId)?.data.label : 'End Workflow'}
          >
            <option value="" className="font-italic text-gray-400">End</option>
            {availableSteps.map(step => (
              <option key={step.id} value={step.id}>
                {step.data.label}
              </option>
            ))}
          </select>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button 
            onClick={onDelete} 
            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            title="Delete Rule"
        >
            <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default RuleRow;