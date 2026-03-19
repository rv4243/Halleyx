import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle2, CircleDashed, Clock, ChevronRight, PlayCircle, Database } from 'lucide-react';

const ExecutionLogsModal = ({ executionId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!executionId) return;
        setLoading(true);
        axios.get(`http://localhost:5000/api/executions/${executionId}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [executionId]);

    if (!executionId) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Database size={20} /></span>
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Execution Trace</h2>
                        </div>
                        <p className="text-xs text-gray-400 font-mono font-bold tracking-widest uppercase ml-12">ID: {executionId}</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-800 bg-white hover:bg-gray-100 border rounded-xl transition shadow-sm">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4 text-blue-500">
                            <CircleDashed size={32} className="animate-spin" />
                            <span className="text-sm font-bold animate-pulse text-gray-400 uppercase tracking-widest">Compiling Trace Data...</span>
                        </div>
                    ) : !data ? (
                        <div className="text-center p-10 text-red-500 font-bold border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                            Failed to load execution details.
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-8">
                            {/* General Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Final Status</span>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border tracking-widest ${
                                        data.execution.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                                        data.execution.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        data.execution.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                                        'bg-blue-50 text-blue-600 border-blue-200'
                                    }`}>
                                        {data.execution.status}
                                    </span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                                    <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Payload Variables</span>
                                    <span className="text-sm font-mono font-bold text-gray-600 break-words">
                                        {Object.keys(data.execution.data).length} defined
                                    </span>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="relative pt-4 pl-4 border-l-2 border-gray-200 space-y-8 ml-4">
                                {data.logs.map((log, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[25.5px] bg-white border-2 border-gray-200 w-4 h-4 rounded-full mt-1.5 shadow-sm"></div>
                                        <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    {log.step_id ? log.step_id.name : 'Unknown Step'}
                                                    {log.status === 'completed' && <CheckCircle2 size={14} className="text-green-500" />}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600 mb-3 ml-1 bg-gray-50 p-2 rounded-lg border border-gray-100 font-medium">
                                                {log.message}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono font-semibold">
                                                <Clock size={12} /> {new Date(log.started_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Wait Node display if paused */}
                                {data.execution.status === 'paused' && data.execution.current_step_id && (
                                    <div className="relative">
                                        <div className="absolute -left-[29px] w-6 h-6 bg-amber-100 border-4 border-white text-amber-500 rounded-full mt-1 flex items-center justify-center shadow-md shadow-amber-200/50"><PlayCircle size={12}/></div>
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-2 border-dashed border-amber-300 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl"></div>
                                            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                Hold / Waiting At
                                            </div>
                                            <div className="text-lg font-black text-gray-800 break-words mb-2">
                                                {data.execution.current_step_id.name}
                                            </div>
                                            <div className="text-xs text-amber-700/80 font-medium">
                                                This step requires external intervention (such as an Admin Approval) before the engine can resume execution into the next paths.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExecutionLogsModal;
