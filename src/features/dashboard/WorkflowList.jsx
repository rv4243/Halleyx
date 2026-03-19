import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, AlertTriangle, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, workflow: null, input: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/workflows');
      if (res.data.workflows.length > 0) {
        setWorkflows(res.data.workflows);
      } else {
        setWorkflows([
          { _id: 'uuid1', name: 'Expense Approval', stepsCount: 4, version: 3, status: 'Active' },
          { _id: 'uuid2', name: 'Employee Onboarding', stepsCount: 2, version: 1, status: 'Active' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setWorkflows([
        { _id: 'uuid1', name: 'Expense Approval', stepsCount: 4, version: 3, status: 'Active' },
        { _id: 'uuid2', name: 'Employee Onboarding', stepsCount: 2, version: 1, status: 'Active' }
      ]);
    }
    setLoading(false);
  };

  const handleDuplicate = async (id) => {
    if (id.startsWith('uuid')) {
      alert("Cannot duplicate a placeholder mock workflow. Create a real one first!");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
      alert("Failed to duplicate workflow.");
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteModal.workflow._id.startsWith('uuid')) {
          setWorkflows(workflows.filter(wf => wf._id !== deleteModal.workflow._id));
      } else {
          await axios.delete(`http://localhost:5000/api/workflows/${deleteModal.workflow._id}`);
          fetchWorkflows();
      }
      setDeleteModal({ isOpen: false, workflow: null, input: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to delete workflow");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Workflows</h1>
            <p className="text-gray-500 mt-1">Manage and execute your business processes.</p>
          </div>
          <button 
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-semibold"
          >
            <Plus size={18} /> Add New Workflow
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4 text-center">Steps</th>
                <th className="p-4 text-center">Version</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf, idx) => (
                <tr key={wf._id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition duration-150">
                  <td className="p-4 pl-6 font-mono text-xs text-gray-400">{wf._id.substring(0,8)}</td>
                  <td className="p-4 font-semibold text-gray-800">{wf.name}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">{wf.stepsCount || 0}</span>
                  </td>
                  <td className="p-4 text-center font-mono text-sm text-gray-600">v{wf.version || 1}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {wf.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleDuplicate(wf._id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Duplicate Workflow"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/editor/${wf._id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Workflow"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/execution/${wf._id}`)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Execute"
                      >
                        <Play size={18} />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, workflow: wf, input: '' })}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Workflow"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {workflows.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    No workflows found. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.workflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
            <button 
              onClick={() => setDeleteModal({ isOpen: false, workflow: null, input: '' })} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 bg-gray-50 rounded-full transition"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center text-center mb-6 mt-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete Workflow?</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                This action cannot be undone. This will permanently delete the workflow 
                <span className="font-bold text-gray-800"> {deleteModal.workflow.name}</span> and all of its associated execution history.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
                Type <span className="text-gray-800 bg-gray-100 px-1 py-0.5 rounded italic">{deleteModal.workflow.name}</span> to confirm
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-sm outline-none focus:border-red-400 focus:bg-white transition-all font-semibold text-center"
                placeholder={deleteModal.workflow.name}
                value={deleteModal.input}
                onChange={(e) => setDeleteModal({ ...deleteModal, input: e.target.value })}
              />
            </div>
            
            <div className="flex justify-between gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, workflow: null, input: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleteModal.input !== deleteModal.workflow.name}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Delete Workflow
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkflowList;