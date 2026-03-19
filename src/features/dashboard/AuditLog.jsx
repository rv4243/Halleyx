import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await axios.get('http://localhost:5000/api/executions');
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_approval': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Activity className="text-blue-600" /> Execution Audit Log
        </h1>
        <p className="text-gray-500 text-sm">Track every process execution across your organization.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Workflow</th>
              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Started At</th>
              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Input Data</th>
              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{log.workflowId?.name || 'Unknown Workflow'}</div>
                  <div className="text-[10px] text-gray-400 font-mono">ID: {log._id.slice(-6)}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    {new Date(log.createdAt).toLocaleDateString()}
                    <span className="text-gray-300">|</span>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                    {log.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                   <div className="text-xs text-gray-500 truncate max-w-[200px] font-mono bg-gray-50 p-1 rounded">
                        {JSON.stringify(log.inputData)}
                   </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => navigate(`/execution/${log._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-2 font-bold text-sm"
                  >
                    <Eye size={16} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic">
                No executions found. Run a workflow to see data here.
            </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;