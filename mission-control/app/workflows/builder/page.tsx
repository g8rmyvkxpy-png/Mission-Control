'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node components
function TriggerNode({ data, selected }: any) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: selected ? '#1a1f36' : '#0f172a',
      border: selected ? '2px solid #6366f1' : '1px solid #334155',
      minWidth: '140px',
    }}>
      <Handle type="source" position={Position.Right} style={{ background: '#6366f1' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{data.icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{data.label}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{data.description}</div>
        </div>
      </div>
    </div>
  );
}

function ActionNode({ data, selected }: any) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: selected ? '#1a1f36' : '#0f172a',
      border: selected ? '2px solid #10b981' : '1px solid #334155',
      minWidth: '140px',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#10b981' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#10b981' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{data.icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{data.label}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{data.description}</div>
        </div>
      </div>
    </div>
  );
}

function ConditionNode({ data, selected }: any) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: selected ? '#1a1f36' : '#0f172a',
      border: selected ? '2px solid #f59e0b' : '1px solid #334155',
      minWidth: '140px',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#f59e0b' }} />
      <Handle type="source" position={Position.Right} id="true" style={{ background: '#10b981', top: '30%' }} />
      <Handle type="source" position={Position.Right} id="false" style={{ background: '#ef4444', top: '70%' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{data.icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{data.label}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{data.description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px' }}>
        <span style={{ color: '#10b981' }}>✓ True</span>
        <span style={{ color: '#ef4444' }}>✗ False</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

// Initial nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 50, y: 200 },
    data: { label: 'Schedule', description: 'Daily at 9AM', icon: '⏰' },
  },
  {
    id: '2',
    type: 'action',
    position: { x: 300, y: 100 },
    data: { label: 'Find Leads', description: 'Run Sales Scout', icon: '🔍' },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 550, y: 100 },
    data: { label: 'If leads > 5', description: 'Check count', icon: '❓' },
  },
  {
    id: '4',
    type: 'action',
    position: { x: 800, y: 50 },
    data: { label: 'Send Email', description: 'Notify team', icon: '📧' },
  },
  {
    id: '5',
    type: 'action',
    position: { x: 800, y: 200 },
    data: { label: 'Create Task', description: 'Add to queue', icon: '📋' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e2-3', source: '2', target: '3', style: { stroke: '#10b981' } },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', style: { stroke: '#10b981' }, label: 'Yes' },
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', style: { stroke: '#ef4444' }, label: 'No' },
];

const paletteItems = [
  { type: 'trigger', label: 'Schedule', icon: '⏰', description: 'Time-based trigger' },
  { type: 'trigger', label: 'Webhook', icon: '🔗', description: 'HTTP webhook' },
  { type: 'trigger', label: 'Event', icon: '⚡', description: 'When event occurs' },
  { type: 'action', label: 'Send Email', icon: '📧', description: 'Send an email' },
  { type: 'action', label: 'Create Task', icon: '📋', description: 'Add task to queue' },
  { type: 'action', label: 'Run Agent', icon: '🤖', description: 'Execute AI agent' },
  { type: 'action', label: 'HTTP Request', icon: '🌐', description: 'Call API' },
  { type: 'action', label: 'Update Record', icon: '💾', description: 'Save to database' },
  { type: 'condition', label: 'If/Else', icon: '❓', description: 'Branch logic' },
  { type: 'condition', label: 'Wait For', icon: '⏳', description: 'Delay' },
];

export default function WorkflowBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('Lead Generation Workflow');
  const [showPalette, setShowPalette] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' } }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  const onDragStart = (event: React.DragEvent, item: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;
      
      const item = JSON.parse(data);
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const newNode: Node = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        position: {
          x: event.clientX - reactFlowBounds.left - 70,
          y: event.clientY - reactFlowBounds.top - 25,
        },
        data: { label: item.label, icon: item.icon, description: item.description },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const deleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const saveWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
    };
    console.log('Saving:', workflow);
    alert(`Workflow "${workflowName}" saved!`);
  };

  const runWorkflow = () => {
    alert(`Running workflow "${workflowName}"...`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#030712', color: '#f0f6fc' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/workflows" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '20px' }}>←</a>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f1f5f9',
              fontSize: '16px',
              fontWeight: 600,
              outline: 'none',
              width: '250px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={saveWorkflow} style={btnStyle}>💾 Save</button>
          <button onClick={runWorkflow} style={{ ...btnStyle, background: '#10b981' }}>▶ Run</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Node Palette */}
        {showPalette && (
          <div style={{
            width: '220px',
            background: '#0f172a',
            borderRight: '1px solid #1e293b',
            padding: '16px',
            overflowY: 'auto',
          }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>
              Triggers
            </div>
            {paletteItems.filter(i => i.type === 'trigger').map((item, i) => (
              <div key={i} draggable onDragStart={(e) => onDragStart(e, item)} style={paletteItemStyle}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{item.description}</div>
                </div>
              </div>
            ))}

            <div style={{ fontWeight: 600, fontSize: '12px', color: '#94a3b8', margin: '16px 0 12px', textTransform: 'uppercase' }}>
              Actions
            </div>
            {paletteItems.filter(i => i.type === 'action').map((item, i) => (
              <div key={i} draggable onDragStart={(e) => onDragStart(e, item)} style={paletteItemStyle}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{item.description}</div>
                </div>
              </div>
            ))}

            <div style={{ fontWeight: 600, fontSize: '12px', color: '#94a3b8', margin: '16px 0 12px', textTransform: 'uppercase' }}>
              Logic
            </div>
            {paletteItems.filter(i => i.type === 'condition').map((item, i) => (
              <div key={i} draggable onDragStart={(e) => onDragStart(e, item)} style={paletteItemStyle}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1 }} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#030712' }}
          >
            <Controls style={{ background: '#1e293b', borderRadius: '8px' }} />
            <MiniMap style={{ background: '#0f172a' }} nodeColor="#6366f1" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
            
            <Panel position="top-right" style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowPalette(!showPalette)} style={panelBtnStyle}>
                {showPalette ? '◀' : '▶'} Nodes
              </button>
            </Panel>

            <Panel position="bottom-center" style={{ color: '#64748b', fontSize: '12px' }}>
              Drag nodes from the palette to build your workflow
            </Panel>
          </ReactFlow>
        </div>

        {/* Config Panel */}
        {selectedNode && (
          <div style={{
            width: '280px',
            background: '#0f172a',
            borderLeft: '1px solid #1e293b',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Configure Node</span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Label</label>
              <input
                value={selectedNode.data?.label || ''}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id ? { ...node, data: { ...node.data, label: e.target.value } } : node
                    )
                  );
                }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Description</label>
              <input
                value={selectedNode.data?.description || ''}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id ? { ...node, data: { ...node.data, description: e.target.value } } : node
                    )
                  );
                }}
                style={inputStyle}
              />
            </div>

            {selectedNode.type === 'trigger' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Schedule</label>
                <select style={inputStyle}>
                  <option>Every day at 9:00 AM</option>
                  <option>Every hour</option>
                  <option>Every week on Monday</option>
                  <option>Custom cron...</option>
                </select>
              </div>
            )}

            {selectedNode.type === 'action' && selectedNode.data?.label === 'Send Email' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>To</label>
                  <input placeholder="email@example.com" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Subject</label>
                  <input placeholder="Email subject" style={inputStyle} />
                </div>
              </>
            )}

            {selectedNode.type === 'action' && selectedNode.data?.label === 'Run Agent' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Agent</label>
                <select style={inputStyle}>
                  <option>Sales Scout</option>
                  <option>Content Writer</option>
                  <option>Research Agent</option>
                </select>
              </div>
            )}

            {selectedNode.type === 'condition' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Condition</label>
                <select style={inputStyle}>
                  <option>If leads &gt; 5</option>
                  <option>If task status = completed</option>
                  <option>If value equals...</option>
                </select>
              </div>
            )}

            <button onClick={deleteNode} style={{ ...btnStyle, background: '#ef4444', marginTop: '20px', width: '100%' }}>
              🗑 Delete Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};

const panelBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#1e293b',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
};

const paletteItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  marginBottom: '6px',
  background: '#1e293b',
  borderRadius: '6px',
  cursor: 'grab',
  border: '1px solid #334155',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#94a3b8',
  marginBottom: '4px',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#f1f5f9',
  fontSize: '12px',
  outline: 'none',
};
