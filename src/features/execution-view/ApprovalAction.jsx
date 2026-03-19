import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ApprovalAction = ({ execution, onAction }) => {
  return (
    <div className="p-6 border-2 border-yellow-400 bg-yellow-50 rounded-xl shadow-lg mt-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">Pending Your Approval</h3>
      <p className="text-sm text-yellow-700 mb-4">
        This workflow is currently stuck at: <strong>{execution.currentStepName}</strong>
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => onAction('approved')}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} /> Approve
        </button>
        <button 
          onClick={() => onAction('rejected')}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <XCircle size={18} /> Reject
        </button>
      </div>
    </div>
  );
};