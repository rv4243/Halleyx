import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const ExecutionStatusHeader = ({ status, logs = [] }) => {
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

  const statusConfig = {
    completed: {
      color: 'bg-green-50 border-green-200 text-green-700',
      icon: <CheckCircle2 className="text-green-500" />,
      label: 'Workflow Completed'
    },
    pending_approval: {
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: <Clock className="text-amber-500" />,
      label: 'Waiting for Approval'
    },
    failed: {
      color: 'bg-red-50 border-red-200 text-red-700',
      icon: <AlertCircle className="text-red-500" />,
      label: 'Execution Error'
    },
    in_progress: {
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />,
      label: 'Processing...'
    }
  };

  const current = statusConfig[status] || statusConfig.in_progress;

  return (
    <div className={`p-4 rounded-2xl border ${current.color} flex items-center justify-between shadow-sm transition-all mb-6`}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          {current.icon}
        </div>
        <div>
          <h2 className="font-black uppercase tracking-widest text-[10px] opacity-70">Current Status</h2>
          <p className="text-lg font-bold leading-tight">{current.label}</p>
        </div>
      </div>

      {lastLog && (
        <div className="text-right border-l pl-6 border-current border-opacity-20 hidden md:block">
          <h2 className="font-black uppercase tracking-widest text-[10px] opacity-70">Last Action</h2>
          <p className="font-semibold">{lastLog.stepName}</p>
        </div>
      )}
    </div>
  );
};

export default ExecutionStatusHeader;