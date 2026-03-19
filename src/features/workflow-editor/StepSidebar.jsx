import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import RuleRow from './RuleRow';

const StepSidebar = ({ selectedStep, steps, globalSchema, onSave, onDelete }) => {
  const [testPayload, setTestPayload] = useState({});

  // Initialize testPayload dynamically based on the globalSchema
  useEffect(() => {
    if (globalSchema && globalSchema.length > 0) {
        const initial = {};
        globalSchema.forEach(f => {
            if (f.type === 'number') initial[f.name] = 0;
            else if (f.type === 'boolean') initial[f.name] = false;
            else initial[f.name] = '';
        });
        
        // Populate with mockup examples just to be helpful if they match
        if (initial.hasOwnProperty('amount')) initial.amount = 250;
        if (initial.hasOwnProperty('country')) initial.country = 'US';
        if (initial.hasOwnProperty('department')) initial.department = 'Finance';
        if (initial.hasOwnProperty('priority')) initial.priority = 'High';

        setTestPayload(initial);
    }
  }, [globalSchema]);

  if (!selectedStep) {
    return (
        <div className="w-96 border-l bg-white h-full p-8 flex flex-col justify-center items-center text-center shadow-inner">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-300">
                <span className="text-gray-300 font-black text-2xl">?</span>
            </div>
            <h3 className="font-bold text-gray-700 mb-2">No Step Selected</h3>
            <p className="text-xs text-gray-500">Click on any node in the canvas to configure its rules and settings.</p>
        </div>
    );
  }

  const updateMetadata = (key, value) => {
    const currentMetadata = selectedStep.data.metadata || {};
    onSave({
      ...selectedStep.data,
      metadata: { ...currentMetadata, [key]: value }
    });
  };

  const addRule = () => {
    const currentRules = selectedStep.data.rules || [];
    const newRule = {
      priority: currentRules.length + 1,
      condition: currentRules.length === 0 ? "DEFAULT" : "", 
      nextStepId: ""
    };
    onSave({ ...selectedStep.data, rules: [...currentRules, newRule] });
  };

  const updateRule = (index, updatedRule) => {
    const newRules = [...(selectedStep.data.rules || [])];
    newRules[index] = updatedRule;
    onSave({ ...selectedStep.data, rules: newRules });
  };

  const deleteRule = (index) => {
    const filtered = selectedStep.data.rules.filter((_, i) => i !== index);
    const reindexed = filtered.map((rule, i) => ({ ...rule, priority: i + 1 }));
    onSave({ ...selectedStep.data, rules: reindexed });
  };

  return (
    <div className="w-[450px] border-l bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col z-20">
      <div className="flex-1">
        
        {/* --- Editable Node Name --- */}
        <div className="mb-1">
            <input 
                className="w-full font-black text-2xl tracking-tight text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 outline-none transition py-1"
                value={selectedStep.data.label}
                onChange={(e) => onSave({ ...selectedStep.data, label: e.target.value })}
            />
        </div>
        <div className="flex items-center gap-2 mb-6">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                selectedStep.type === 'approval' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                selectedStep.type === 'completed' ? 'bg-green-50 text-green-600 border-green-200' : 
                selectedStep.type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                'bg-purple-50 text-purple-600 border-purple-200'}`}>
                {selectedStep.type} Step
            </span>
            <span className="text-[10px] text-gray-400 font-mono">ID: {selectedStep.id}</span>
        </div>

        {/* --- Approval Section --- */}
        {selectedStep.type === 'approval' && (
            <div className="mb-6 p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                <label className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider block mb-2">Approver Assignment</label>
                <input 
                    className="w-full p-2.5 border border-yellow-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition"
                    placeholder="e.g. manager@company.com or $manager_email"
                    value={selectedStep.data.metadata?.assignee_email || ''}
                    onChange={(e) => updateMetadata('assignee_email', e.target.value)}
                />
            </div>
        )}

        {/* --- DYNAMIC RULES SECTION (Tabular) --- */}
        <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 tracking-tight">Rules</h3>
                <button 
                    onClick={addRule}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                    <Plus size={14} /> Add Rule
                </button>
            </div>

            {(!selectedStep.data.rules || selectedStep.data.rules.length === 0) ? (
                <div className="text-xs text-gray-400 text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    No rules added. This step will end the workflow.
                </div>
            ) : (
                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[50px_1fr_130px_36px] gap-2 p-2.5 bg-gray-50/80 border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <div className="text-center">Pri</div>
                        <div>Condition</div>
                        <div>Next Step</div>
                        <div></div>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-100">
                    {selectedStep.data.rules.map((rule, index) => (
                        <RuleRow 
                            key={index}
                            rule={rule}
                            testData={testPayload} 
                            availableSteps={steps.filter(s => s.id !== selectedStep.id)}
                            onUpdate={(updated) => updateRule(index, updated)}
                            onDelete={() => deleteRule(index)}
                        />
                    ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="mt-8 pt-4">
         <button 
           onClick={() => onDelete(selectedStep.id)}
           className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all rounded-xl text-sm font-bold w-full justify-center"
         >
           <Trash2 size={16} /> Delete Step
         </button>
      </div>
    </div>
  );
};

export default StepSidebar;