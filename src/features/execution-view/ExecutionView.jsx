import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import InputForm from './InputForm';
import ExecutionStatusHeader from './ExecutionStatusHeader';

const ExecutionView = () => {
  const { id } = useParams();

  const [workflowInfo, setWorkflowInfo] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [inputSchema, setInputSchema] = useState({});
  const [executionLogs, setLogs] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
        setIsLoading(false);
        return;
    }

    const loadData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/workflows/${id}`);
        const { workflow, steps, rules } = data;

        setWorkflowInfo(workflow);
        setInputSchema(workflow.input_schema || {});

        const fetchedNodes = steps.map((s, idx) => ({
            id: s._id,
            type: s.step_type,
            position: { x: 150 + (idx % 2)*200, y: 100 + idx*140 },
            data: { label: s.name }
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
        console.error(err);
        alert("Failed to load workflow data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const runWorkflow = async (formData) => {
    setCurrentStatus('in_progress');
    try {
      const response = await axios.post(`http://localhost:5000/api/execute/${id}`, {
        inputData: formData
      });
      
      const { logs, status } = response.data;
      
      setLogs(logs);
      setCurrentStatus(status);
      highlightPath(logs);
    } catch (err) {
      console.error(err);
      setCurrentStatus('failed');
      alert("Execution failed: " + (err.response?.data?.error || err.message));
    }
  };

  const highlightPath = (logs) => {
    const visitedStepIds = logs.map(log => log.stepId);
    
    setNodes((nds) =>
      nds.map((node) => {
        if (visitedStepIds.includes(node.id)) {
          return {
            ...node,
            style: { 
              ...node.style, 
              backgroundColor: '#d1fae5',
              border: '2px solid #10b981',
              transition: 'all 0.5s ease-in-out'
            }
          };
        }
        return node;
      })
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-gray-500 font-bold">Loading Execution View...</div>;
  
  if (!id) return <div className="flex justify-center items-center h-screen text-gray-500 font-bold">No workflow selected. Go back to Dashboard and select one to execute.</div>;

  return (
    <div className="flex h-[calc(100vh-65px)] w-full bg-gray-100 font-sans">
      <div className="w-1/3 p-6 bg-white border-r shadow-2xl z-20 overflow-y-auto">
        <ExecutionStatusHeader status={currentStatus} logs={executionLogs} />
        
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{workflowInfo?.name || 'Workflow'} Data</h2>
            <InputForm schema={inputSchema} onRun={runWorkflow} />
        </div>
        
        <div className="">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Live Execution Trace</h3>
          <div className="space-y-3">
            {executionLogs.map((log, i) => (
              <div key={i} className="text-xs p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{log.stepName}</span>
                    <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <div className="text-gray-500 italic">{log.decision}</div>
              </div>
            ))}
            {executionLogs.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl text-gray-300 text-sm">
                    No execution data yet
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50">
        <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            nodesDraggable={false} 
            nodesConnectable={false}
            fitView
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ExecutionView;