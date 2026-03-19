import React from 'react';
import { AlertCircle, CheckCircle2, Save, X } from 'lucide-react';

const SaveModal = ({ isOpen, onClose, onConfirm, workflowData }) => {
  if (!isOpen) return null;

  const { nodes, edges } = workflowData;
  const issues = [];

  // Basic Validation Logic
  nodes.forEach(node => {
    if (!node.data.rules || node.data.rules.length === 0) {
      issues.push(`Step "${node.data.label}" has no rules and will end the workflow.`);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Save className="text-blue-600" size={20} /> Review & Save
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Workflow Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <div className="text-2xl font-black text-blue-600">{nodes.length}</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase">Total Steps</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
              <div className="text-2xl font-black text-purple-600">{edges.length}</div>
              <div className="text-[10px] font-bold text-purple-400 uppercase">Connections</div>
            </div>
          </div>

          {/* Issue Warnings */}
          {issues.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase">
                <AlertCircle size={14} /> Optimization Tips
              </div>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="text-[11px] text-amber-600">• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Step Overview</h3>
            <div className="max-height-[200px] overflow-y-auto space-y-1 pr-2">
              {nodes.map(node => (
                <div key={node.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-xs font-medium text-gray-700">
                   <div className={`w-2 h-2 rounded-full ${node.type === 'approval' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                   {node.data.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-500 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 size={18} /> Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;