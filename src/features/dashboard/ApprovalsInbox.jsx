import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardCheck } from 'lucide-react';

const ApprovalsInbox = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/executions?status=pending_approval');
        setPending(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (id, decision) => {
    try {
      await axios.post(`http://localhost:5000/api/execute/${id}/resume`, { decision });
      setPending(prev => prev.filter(item => item._id !== id));
      alert(`Workflow ${decision}!`);
    } catch (err) {
      alert("Error processing approval");
    }
  };

  if (loading) return <div className="p-8 text-gray-500 italic">Loading approvals...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-100">
            <ClipboardCheck className="text-white" size={24} />
        </div>
        Pending Approvals
      </h1>

      {pending.length === 0 ? (
        <div className="text-gray-400 bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center shadow-sm">
          <p className="font-medium text-lg">All caught up!</p>
          <p className="text-sm">No workflows are currently waiting for your decision.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                    {item.workflowId?.name || 'Expense Claim'}: ${item.inputData.amount}
                </h3>
                <p className="text-sm text-gray-400 font-medium tracking-tight">
                    Requested by: {item.inputData.user || 'Unknown User'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                    Step: {item.logs[item.logs.length - 1]?.stepName || 'Approval'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleAction(item._id, 'rejected')}
                  className="px-6 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(item._id, 'approved')}
                  className="px-8 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-100 transition active:scale-95"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CRITICAL: MUST EXPORT THE COMPONENT ---
export default ApprovalsInbox;