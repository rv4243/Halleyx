import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, Search, ShieldCheck, Mail, LogOut, UserCircle, History } from 'lucide-react';

const AdminApprovals = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Auth State
    const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('user_email') || null);
    const [loginInput, setLoginInput] = useState('');

    useEffect(() => {
        if (currentUserEmail) {
            fetchPending();
        }
    }, [currentUserEmail]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginInput.trim()) {
            const email = loginInput.trim().toLowerCase();
            localStorage.setItem('user_email', email);
            setCurrentUserEmail(email);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        setCurrentUserEmail(null);
        setPending([]);
    };

    const fetchPending = async () => {
        setLoading(true);
        try {
            // Added &t cache-buster so browsers don't serve dead data
            const res = await axios.get(`http://localhost:5000/api/admin/executions/pending?email=${encodeURIComponent(currentUserEmail)}&t=${Date.now()}`);
            setPending(res.data);
        } catch (err) {
            console.error(err);
            alert("API FETCH ERROR: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (id, action) => {
        try {
            await axios.post(`http://localhost:5000/api/admin/executions/${id}/${action}`);
            alert(`Execution successfully ${action}d!`);
            fetchPending(); // Refresh list
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} execution.`);
        }
    };

    // --- LOGIN SCREEN ---
    if (!currentUserEmail) {
        return (
            <div className="min-h-[calc(100vh-65px)] bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Access Your Inbox</h2>
                    <p className="text-gray-500 text-sm mt-2 mb-8 font-medium">Please enter your assigned work email to view pending workflow approvals awaiting your authorization.</p>
                    
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                required
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                placeholder="e.g. ceo@company.com"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition font-medium"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition transform hover:-translate-y-1">
                            Secure Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- DASHBOARD (INBOX) SCREEN ---
    return (
        <div className="p-8 bg-[#f8fafc] min-h-[calc(100vh-65px)]">
            <div className="max-w-5xl mx-auto">
                
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 justify-center items-center rounded-3xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                            <ShieldCheck size={28} className="text-blue-600" /> My Approvals
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium text-sm">Review workflows awaiting your direct authorization.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2">
                           <UserCircle size={32} className="text-gray-300" />
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Logged in as</span>
                             <span className="text-sm font-bold text-gray-700">{currentUserEmail}</span>
                           </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <button onClick={handleLogout} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="text-gray-400 font-bold">Scanning secure database...</div>
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100 shadow-inner">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Inbox Zero!</h3>
                            <p className="text-gray-500 text-base mt-2">There are no workflows currently waiting for your specific approval.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 flex flex-col">
                            {pending.map((req) => (
                                <div key={req.id} className="p-8 hover:bg-blue-50/30 transition-colors flex flex-col lg:flex-row gap-8 items-start relative group">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border border-amber-200 shadow-sm inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Action Required
                                            </span>
                                            <span className="font-mono text-xs text-gray-400 font-semibold">REF: {req.id.substring(0,8)}</span>
                                            <span className="text-xs text-gray-400 font-medium ml-auto flex items-center gap-1">
                                                <History size={12} /> {new Date(req.startedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{req.workflowName}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">
                                            Currently delayed at step: <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{req.stepName}</strong>
                                        </p>
                                        
                                        <div className="bg-gray-900 rounded-2xl p-5 shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest flex items-center gap-2">
                                                <span>Live Execution Payload</span>
                                                <Search size={12} className="text-gray-500" />
                                            </div>
                                            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                                                {JSON.stringify(req.data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-56 shrink-0 mt-2 lg:mt-10">
                                        <button 
                                            onClick={() => handleDecision(req.id, 'approve')}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm"
                                        >
                                            <CheckCircle2 size={20} /> Authorize & Approve
                                        </button>
                                        <button 
                                            onClick={() => handleDecision(req.id, 'reject')}
                                            className="flex-1 bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 hover:border-red-200 text-sm"
                                        >
                                            <XCircle size={18} /> Reject Request
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple localized Lock icon for the login view so we don't need an extra import hook
const Lock = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default AdminApprovals;
