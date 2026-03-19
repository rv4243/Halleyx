import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import WorkflowList from './features/dashboard/WorkflowList';
import ExecutionView from './features/execution-view/ExecutionView';
import EditorCanvas from './features/workflow-editor/EditorCanvas';
import AdminApprovals from './features/admin/AdminApprovals';
import ExecutionLogsModal from './features/dashboard/ExecutionLogsModal';
import { History, X, Search } from 'lucide-react';
import axios from 'axios';

// Slide-over Audit Log Component
const AuditLogPanel = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTraceId, setSelectedTraceId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axios.get('http://localhost:5000/api/executions')
                .then(res => setLogs(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
            setSelectedTraceId(null);
        }
    }, [isOpen]);

    return (
        <>
        <div className={`fixed inset-y-0 right-0 w-[900px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><History size={24} className="text-blue-600"/> System Audit Log</h2>
                  <p className="text-xs font-bold text-gray-400 mt-1 tracking-wider uppercase">Real-Time Execution History Tracker</p>
                </div>
                <button onClick={onClose} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-red-500 shadow-sm border hover:border-red-200 transition-all">
                  <X size={18} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {loading ? (
                    <div className="text-center text-gray-400 font-bold p-12">Fetching secure audit logs...</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-black tracking-wider w-full">
                                    <th className="p-4 indent-2">Execution ID</th>
                                    <th className="p-4">Workflow</th>
                                    <th className="p-4 text-center">Ver</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Started By</th>
                                    <th className="p-4">Start Time</th>
                                    <th className="p-4">End Time</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 py-3 indent-2 font-mono text-xs text-blue-400/80 font-bold">{log.id.substring(0,8)}</td>
                                        <td className="p-4 py-3 font-bold text-gray-700">{log.workflowName}</td>
                                        <td className="p-4 py-3 text-center font-mono text-xs text-gray-500 font-semibold">v{log.version}</td>
                                        <td className="p-4 py-3">
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                                                log.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' : 
                                                log.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-200' : 
                                                'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-4 py-3 text-[11px] font-bold text-gray-500">{log.startedBy}</td>
                                        <td className="p-4 py-3 text-[11px] font-medium text-gray-500 tabular-nums">{new Date(log.startTime).toLocaleString()}</td>
                                        <td className="p-4 py-3 text-[11px] font-medium text-gray-500 tabular-nums">{log.endTime ? new Date(log.endTime).toLocaleString() : '-'}</td>
                                        <td className="p-4 py-3 text-center">
                                            <button onClick={() => setSelectedTraceId(log.id)} className="text-[10px] font-black text-blue-600 bg-white border border-blue-200 shadow-sm px-3 flex items-center gap-1.5 justify-center py-1.5 rounded-lg hover:bg-blue-50 hover:border-blue-300 mx-auto transition-all">
                                                <Search size={12}/> Logs
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan="8" className="p-10 text-center text-gray-400 font-semibold border-b border-transparent">No execution history found in the database.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
        <ExecutionLogsModal executionId={selectedTraceId} onClose={() => setSelectedTraceId(null)} />
        </>
    );
};

// Top navigation bar containing the trigger
const TopNav = ({ onOpenAudit }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isProtecting = location.pathname.startsWith('/editor') || location.pathname.startsWith('/execution');
      if (isProtecting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  const handleNav = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) return;
    
    const isProtecting = location.pathname.startsWith('/editor') || location.pathname.startsWith('/execution');
    if (isProtecting) {
      if (window.confirm("Are you sure you want to leave? Any unsaved changes or execution progress will be lost.")) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="bg-white border-b px-6 py-4 flex gap-6 items-center shadow-sm z-50 relative">
      <div className="font-black text-xl text-blue-600 mr-8 tracking-tight">HalleyX SaaS</div>
      <a href="/" onClick={(e) => handleNav(e, '/')} className="text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">Dashboard</a>
      <a href="/editor" onClick={(e) => handleNav(e, '/editor')} className="text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">Workflow Editor</a>
      <a href="/execution" onClick={(e) => handleNav(e, '/execution')} className="text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">Execution View</a>
      <div className="w-px h-6 bg-gray-200 mx-2"></div>
      <a onClick={(e) => { e.preventDefault(); window.open('/admin', '_blank'); }} className="text-indigo-600 hover:text-indigo-800 font-bold transition cursor-pointer flex items-center gap-1">
          My Inbox <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
      
      {/* Right corner audit log trigger */}
      <button 
        onClick={onOpenAudit} 
        className="ml-auto text-gray-700 hover:text-blue-700 font-bold text-xs bg-gray-50 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm border border-gray-200 hover:border-blue-200"
      >
         <History size={16} /> Audit Log
      </button>
    </nav>
  );
};

function App() {
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans overflow-x-hidden relative">
        <TopNav onOpenAudit={() => setIsAuditOpen(true)} />
        <AuditLogPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
        
        {/* If the panel is open, show a backdrop overlay so it acts like a modal */}
        {isAuditOpen && (
            <div 
                className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[9998]" 
                onClick={() => setIsAuditOpen(false)}
            />
        )}

        <main className="flex-1 flex flex-col relative w-full">
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/editor" element={<EditorCanvas />} />
            <Route path="/editor/:id" element={<EditorCanvas />} />
            <Route path="/execution" element={<ExecutionView />} />
            <Route path="/execution/:id" element={<ExecutionView />} />
            <Route path="/admin" element={<AdminApprovals />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
