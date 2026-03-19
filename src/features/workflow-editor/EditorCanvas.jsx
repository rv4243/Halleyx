import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    addEdge, 
    useNodesState, 
    useEdgesState,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import StepSidebar from './StepSidebar';
import SaveModal from './SaveModal';
import axios from 'axios';
import { Settings, Plus, X, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ApprovalNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };
  return (
    <div className="px-5 py-3 shadow-lg rounded-xl bg-yellow-50/90 backdrop-blur-sm border-2 border-yellow-400 min-w-[180px] relative group transition-all hover:shadow-xl">
      <button onClick={handleDelete} className="absolute -top-3 -right-3 bg-white text-red-500 border border-red-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10">x</button>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-yellow-500 !-top-1.5 !border-2 !border-white" />
      <div className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Approval</div>
      <div className="text-sm font-bold text-gray-800">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-yellow-500 !-bottom-1.5 !border-2 !border-white" />
    </div>
  );
};

const TaskNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };
  return (
    <div className="px-5 py-3 shadow-lg rounded-xl bg-blue-50/90 backdrop-blur-sm border-2 border-blue-400 min-w-[180px] relative group transition-all hover:shadow-xl">
      <button onClick={handleDelete} className="absolute -top-3 -right-3 bg-white text-red-500 border border-red-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10">x</button>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !-top-1.5 !border-2 !border-white" />
      <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Task</div>
      <div className="text-sm font-bold text-gray-800">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !-bottom-1.5 !border-2 !border-white" />
    </div>
  );
};

const NotificationNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };
  return (
    <div className="px-5 py-3 shadow-lg rounded-xl bg-purple-50/90 backdrop-blur-sm border-2 border-purple-400 min-w-[180px] relative group transition-all hover:shadow-xl">
      <button onClick={handleDelete} className="absolute -top-3 -right-3 bg-white text-red-500 border border-red-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10">x</button>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !-top-1.5 !border-2 !border-white" />
      <div className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">Notification</div>
      <div className="text-sm font-bold text-gray-800">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !-bottom-1.5 !border-2 !border-white" />
    </div>
  );
};

const CompletedNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };
  return (
    <div className="px-5 py-3 shadow-lg rounded-xl bg-green-50/90 backdrop-blur-sm border-2 border-green-400 min-w-[180px] relative group transition-all hover:shadow-xl">
      <button onClick={handleDelete} className="absolute -top-3 -right-3 bg-white text-red-500 border border-red-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10">x</button>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 !-top-1.5 !border-2 !border-white" />
      <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Completed</div>
      <div className="text-sm font-bold text-gray-800">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  approval: ApprovalNode,
  task: TaskNode,
  notification: NotificationNode,
  completed: CompletedNode
};

// Default Slate for New Workflows
const initialNodes = [
    { id: 'manager_acc', type: 'approval', position: { x: 300, y: 50 }, data: { label: 'Manager Approval', rules: [], metadata: { assignee_email: 'manager@company.com' } } },
    { id: 'finance_notify', type: 'notification', position: { x: 100, y: 250 }, data: { label: 'Finance Notification', rules: [] } },
    { id: 'ceo_appr', type: 'approval', position: { x: 300, y: 250 }, data: { label: 'CEO Approval', rules: [], metadata: { assignee_email: 'ceo@company.com' } } },
    { id: 'task_rej', type: 'task', position: { x: 500, y: 250 }, data: { label: 'Task Rejection', rules: [] } },
    { id: 'completed_step', type: 'completed', position: { x: 300, y: 450 }, data: { label: 'Completed', rules: [] } },
];

const SchemaModal = ({ isOpen, onClose, schema, setSchema, wfName, setWfName, wfVersion, setWfVersion }) => {
    if (!isOpen) return null;

    const addField = () => {
        setSchema([...schema, { name: '', type: 'string', required: false, enum: [] }]);
    };

    const updateField = (idx, key, val) => {
        const newArr = [...schema];
        newArr[idx][key] = val;
        setSchema(newArr);
    };

    const deleteField = (idx) => {
        setSchema(schema.filter((_, i) => i !== idx));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                            <Settings className="text-gray-500" size={20} /> Workflow Settings
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Configure global details and input schema</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 bg-white border border-gray-200 rounded-full shadow-sm transition"><X size={16}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Workflow Name</label>
                            <input
                                className="w-full p-3 border rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-semibold"
                                value={wfName}
                                onChange={e => setWfName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Version</label>
                            <input
                                type="number"
                                className="w-full p-3 border rounded-xl bg-gray-50 text-sm outline-none font-mono"
                                value={wfVersion}
                                onChange={e => setWfVersion(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Input Schema (Variables)</label>
                            <button onClick={addField} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                                <Plus size={14}/> Add Field
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {schema.map((field, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-4 border rounded-xl bg-gray-50/50 group hover:border-blue-200 transition">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <input 
                                                className="flex-1 p-2 border rounded-lg text-sm font-mono outline-none focus:border-blue-400"
                                                placeholder="field_name"
                                                value={field.name}
                                                onChange={e => updateField(idx, 'name', e.target.value)}
                                            />
                                            <select 
                                                className="w-32 p-2 border rounded-lg text-sm bg-white outline-none focus:border-blue-400"
                                                value={field.type}
                                                onChange={e => updateField(idx, 'type', e.target.value)}
                                            >
                                                <option value="string">String</option>
                                                <option value="number">Number</option>
                                                <option value="boolean">Boolean</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-blue-600"
                                                    checked={field.required}
                                                    onChange={e => updateField(idx, 'required', e.target.checked)}
                                                />
                                                Required Field
                                            </label>
                                            
                                            <div className="flex-1">
                                                <input 
                                                    className="w-full p-2 border rounded-lg text-xs font-mono outline-none bg-white placeholder-gray-300"
                                                    placeholder="Enum values (comma separated) e.g. High,Medium,Low"
                                                    value={(field.enum || []).join(',')}
                                                    onChange={e => updateField(idx, 'enum', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                                    title="Allowed Values (Optional)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteField(idx)} className="text-gray-400 hover:text-red-500 p-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            {schema.length === 0 && (
                                <div className="text-center p-8 border-2 border-dashed rounded-xl text-gray-400 text-sm">
                                    No input fields defined. Workflows usually require input data to run rules!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition">Done</button>
                </div>
            </div>
        </div>
    );
}

const EditorCanvasInner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isLoading, setIsLoading] = useState(!!id);
    
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

    // Global Workflow State
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [workflowVersion, setWorkflowVersion] = useState(1);
    const [inputSchema, setInputSchema] = useState([]);

    // LOAD WORKFLOW ON MOUNT IF ID EXISTS
    useEffect(() => {
        if (!id) {
            setNodes(initialNodes);
            setWorkflowName('Expense Approval');
            setWorkflowVersion(3);
            setInputSchema([
                { name: 'amount', type: 'number', required: true, enum: [] },
                { name: 'country', type: 'string', required: true, enum: [] },
                { name: 'department', type: 'string', required: false, enum: [] },
                { name: 'priority', type: 'string', required: true, enum: ['High', 'Medium', 'Low'] },
            ]);
            return;
        }

        const loadWorkflow = async () => {
            try {
                const API_BASE = 'http://localhost:5000';
                const { data } = await axios.get(`${API_BASE}/api/workflows/${id}`);
                const { workflow, steps, rules } = data;

                setWorkflowName(workflow.name);
                setWorkflowVersion(workflow.version);

                if (workflow.input_schema) {
                    const schemaArr = Object.entries(workflow.input_schema).map(([name, conf]) => ({
                        name,
                        type: conf.type,
                        required: conf.required,
                        enum: conf.enum || []
                    }));
                    setInputSchema(schemaArr);
                }

                const fetchedNodes = steps.map((s, idx) => ({
                    id: s._id,
                    type: s.step_type,
                    position: { x: 150 + (idx % 2)*200, y: 100 + idx*140 },
                    data: {
                        label: s.name,
                        metadata: s.metadata,
                        rules: rules.filter(r => r.step_id === s._id).map(r => ({
                            priority: r.priority,
                            condition: r.condition,
                            nextStepId: r.next_step_id || ""
                        })).sort((a,b) => a.priority - b.priority)
                    }
                }));

                const fetchedEdges = rules.filter(r => r.next_step_id).map(r => ({
                    id: `edge_${r._id}`,
                    source: r.step_id,
                    target: r.next_step_id,
                    animated: true,
                    markerEnd: { type: 'arrow' },
                    style: { strokeWidth: 2, stroke: '#94a3b8' }
                }));

                setNodes(fetchedNodes);
                setEdges(fetchedEdges);
            } catch (err) {
                console.error("Failed to load workflow", err);
                alert("Failed to load workflow");
            } finally {
                setIsLoading(false);
            }
        };
        loadWorkflow();
    }, [id, setNodes, setEdges]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: 'arrow' }, style: { strokeWidth: 2, stroke: '#94a3b8' } }, eds));
        
        setNodes((nds) => nds.map(n => {
            if (n.id === params.source) {
                const currentRules = n.data.rules || [];
                if (!currentRules.some(r => r.nextStepId === params.target)) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            rules: [
                                ...currentRules,
                                {
                                    priority: currentRules.length + 1,
                                    condition: currentRules.length === 0 ? "DEFAULT" : "",
                                    nextStepId: params.target
                                }
                            ]
                        }
                    };
                }
            }
            return n;
        }));
    }, [setEdges, setNodes]);

    const onEdgesDelete = useCallback((edgesToDelete) => {
        setNodes((nds) => nds.map(n => {
            const edgesFromNode = edgesToDelete.filter(e => e.source === n.id);
            if (edgesFromNode.length > 0) {
                const targetsToRemove = edgesFromNode.map(e => e.target);
                const updatedRules = (n.data.rules || []).filter(r => !targetsToRemove.includes(r.nextStepId));
                const reindexed = updatedRules.map((r, i) => ({ ...r, priority: i + 1 }));
                return { ...n, data: { ...n.data, rules: reindexed } };
            }
            return n;
        }));
    }, [setNodes]);

    const onNodeClick = (event, node) => {
        setSelectedNode(node);
    };

    const addNewStep = (type) => {
        const newId = `step_${Date.now()}`;
        const newNode = {
            id: newId,
            type,
            position: { x: 100, y: nodes.length * 100 + 50 },
            data: {
                label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                metadata: {},
                rules: []
            },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const saveWorkflow = async () => {
        try {
            const API_BASE = 'http://localhost:5000';

            const formattedSchema = inputSchema.reduce((acc, field) => {
                acc[field.name] = { type: field.type, required: field.required };
                if (field.enum && field.enum.length > 0) acc[field.name].enum = field.enum;
                return acc;
            }, {});

            let workflowId = id;

            // 1. Save or Update Workflow Core
            if (id) {
                await axios.put(`${API_BASE}/api/workflows/${id}`, {
                    name: workflowName,
                    version: workflowVersion,
                    input_schema: formattedSchema
                });
            } else {
                const workflowRes = await axios.post(`${API_BASE}/api/workflows`, {
                    name: workflowName,
                    version: workflowVersion,
                    input_schema: formattedSchema
                });
                workflowId = workflowRes.data._id;
            }

            // 2. Fetch existing steps to manage deletions
            let existingStepIds = [];
            if (id) {
                const stepsRes = await axios.get(`${API_BASE}/api/workflows/${workflowId}/steps`);
                existingStepIds = stepsRes.data.map(s => s._id);
            }

            const stepIdMap = {}; 
            const targetIds = new Set(edges.map(e => e.target));
            const startNode = nodes.find(n => !targetIds.has(n.id)) || nodes[0];

            // 3. Sync Steps (Create or Update)
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const isExisting = /^[a-fA-F0-9]{24}$/.test(n.id);
                let stepRes;
                if (isExisting) {
                    stepRes = await axios.put(`${API_BASE}/api/steps/${n.id}`, {
                        name: n.data.label,
                        step_type: n.type,
                        order: i + 1,
                        metadata: n.data.metadata || {}
                    });
                    stepIdMap[n.id] = stepRes.data._id;
                } else {
                    const oldId = n.id;
                    stepRes = await axios.post(`${API_BASE}/api/workflows/${workflowId}/steps`, {
                        name: n.data.label,
                        step_type: n.type,
                        order: i + 1,
                        metadata: n.data.metadata || {}
                    });
                    stepIdMap[oldId] = stepRes.data._id;
                    stepIdMap[stepRes.data._id] = stepRes.data._id;
                    n.id = stepRes.data._id; 
                }
            }

            // 4. Delete steps removed from canvas
            if (id) {
                const savedIds = Object.values(stepIdMap);
                const toDelete = existingStepIds.filter(eid => !savedIds.includes(eid));
                for (const delId of toDelete) {
                    await axios.delete(`${API_BASE}/api/steps/${delId}`);
                }
            }

            // 5. Sync Rules
            for (const n of nodes) {
                const mongoStepId = stepIdMap[n.id];
                
                if (id || /^[a-fA-F0-9]{24}$/.test(n.id)) {
                    await axios.delete(`${API_BASE}/api/steps/${mongoStepId}/rules`);
                }

                const rulesToPersist = Array.isArray(n.data.rules) ? n.data.rules : [];
                for (let r = 0; r < rulesToPersist.length; r++) {
                    const rule = rulesToPersist[r];
                    const mongoNextStepId = rule.nextStepId ? stepIdMap[rule.nextStepId] : null;

                    await axios.post(`${API_BASE}/api/steps/${mongoStepId}/rules`, {
                        name: `Rule ${rule.priority} for ${n.data.label}`,
                        type: 'transition',
                        priority: rule.priority || (r + 1),
                        condition: rule.condition || 'DEFAULT',
                        next_step_id: mongoNextStepId
                    });
                }
            }

            // 6. Set Start Node
            if (startNode && stepIdMap[startNode.id]) {
                await axios.put(`${API_BASE}/api/workflows/${workflowId}`, {
                    start_step_id: stepIdMap[startNode.id]
                });
            }

            alert('Workflow Saved Successfully to Database!');
            if (!id && workflowId) {
                navigate(`/editor/${workflowId}`);
            }
        } catch (error) {
            console.error("Save Error:", error.response?.data || error);
            alert('Error saving workflow: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleConfirmSave = async () => {
        await saveWorkflow();
        setIsSaveModalOpen(false);
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading Workflow...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-65px)] w-full bg-[#f8fafc]">
            <div className="flex-1 relative border-r overflow-hidden shadow-inner">
                
                {/* --- Top Navigation / Name --- */}
                <div className="absolute top-4 left-6 z-10 flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 pl-4 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Editing Workflow</span>
                        <span className="font-bold text-gray-800">{workflowName} <span className="text-gray-400 font-mono text-xs font-normal">v{workflowVersion}</span></span>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-1"></div>
                    <button 
                        onClick={() => setIsSchemaModalOpen(true)}
                        className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-gray-600 hover:text-blue-600 transition flex items-center gap-2 shadow-sm font-semibold text-sm"
                    >
                        <Settings size={16}/> Schema Config
                    </button>
                </div>

                {/* --- Action Toolbar --- */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setIsSaveModalOpen(true)} 
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2"
                    >
                        {id ? 'Update Workflow' : 'Save Workflow'}
                    </button>
                </div>

                {/* --- Components Menu --- */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-gray-100">
                    <button onClick={() => addNewStep('task')} className="flex flex-col items-center justify-center w-16 h-16 hover:bg-blue-50 rounded-xl text-gray-600 hover:text-blue-600 transition group gap-1">
                        <div className="w-4 h-4 bg-blue-500 rounded-sm group-hover:scale-110 shadow-sm transition"></div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Task</span>
                    </button>
                    <button onClick={() => addNewStep('approval')} className="flex flex-col items-center justify-center w-16 h-16 hover:bg-yellow-50 rounded-xl text-gray-600 hover:text-yellow-600 transition group gap-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full group-hover:scale-110 shadow-sm transition"></div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Approval</span>
                    </button>
                    <button onClick={() => addNewStep('notification')} className="flex flex-col items-center justify-center w-16 h-16 hover:bg-purple-50 rounded-xl text-gray-600 hover:text-purple-600 transition group gap-1">
                        <div className="w-4 h-4 bg-purple-500 rounded-sm rotate-45 group-hover:scale-110 shadow-sm transition"></div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Notify</span>
                    </button>
                    <button onClick={() => addNewStep('completed')} className="flex flex-col items-center justify-center w-16 h-16 hover:bg-green-50 rounded-xl text-gray-600 hover:text-green-600 transition group gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full group-hover:scale-110 shadow-sm transition"></div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Complete</span>
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onEdgesDelete={onEdgesDelete}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    fitView
                >
                    <Background color="#cbd5e1" gap={24} size={2} />
                    <Controls className="!bg-white !rounded-xl !shadow-lg border-none" />
                </ReactFlow>
            </div>

            <StepSidebar
                selectedStep={selectedNode}
                steps={nodes}
                globalSchema={inputSchema}
                onSave={(updatedNodeData) => {
                    const updatedNode = { ...selectedNode, data: updatedNodeData };
                    setNodes((nds) => 
                        nds.map((node) => node.id === selectedNode.id ? updatedNode : node)
                    );
                    setSelectedNode(updatedNode);

                    // Sync visual edges based on rules
                    setEdges((eds) => {
                        const filteredEdges = eds.filter(e => e.source !== selectedNode.id);
                        const newEdges = (updatedNodeData.rules || [])
                            .filter(r => r.nextStepId)
                            .map(r => ({
                                id: `edge_${selectedNode.id}_${r.nextStepId}_${Math.random()}`,
                                source: selectedNode.id,
                                target: r.nextStepId,
                                animated: true,
                                markerEnd: { type: 'arrow' },
                                style: { strokeWidth: 2, stroke: '#94a3b8' }
                            }));
                        return [...filteredEdges, ...newEdges];
                    });
                }}
                onDelete={(nodeId) => {
                    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
                    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
                    setSelectedNode(null);
                }}
            />

            <SaveModal 
                isOpen={isSaveModalOpen} 
                onClose={() => setIsSaveModalOpen(false)} 
                onConfirm={handleConfirmSave}
                workflowData={{ nodes, edges }}
            />

            <SchemaModal
                isOpen={isSchemaModalOpen}
                onClose={() => setIsSchemaModalOpen(false)}
                schema={inputSchema}
                setSchema={setInputSchema}
                wfName={workflowName}
                setWfName={setWorkflowName}
                wfVersion={workflowVersion}
                setWfVersion={setWorkflowVersion}
            />
        </div>
    );
};

export default function EditorCanvas() {
    return (
        <ReactFlowProvider>
            <EditorCanvasInner />
        </ReactFlowProvider>
    );
}