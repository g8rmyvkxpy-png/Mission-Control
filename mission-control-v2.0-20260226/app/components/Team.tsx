'use client';

import { useState, useEffect } from 'react';

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: 'active' | 'working' | 'idle';
  avatar: string;
  color: string;
  goal: string;
  about: string;
  skills: string[];
  soul: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

const allAgents: Agent[] = [
  { id: 'neo', name: 'Neo', role: 'Chief Orchestrator', specialty: 'Coordinating all agents', status: 'active', avatar: '🦅', color: '#f97316', goal: 'Lead squad to $1M', about: 'Your lead AI assistant.', skills: ['Task Delegation', 'Quality Control', 'Strategy'], soul: 'I am the bridge between Deva and my agent squad.' },
  { id: 'atlas', name: 'Atlas', role: 'Sales Lead', specialty: 'Lead Generation', status: 'idle', avatar: '💰', color: '#14b8a6', goal: 'Generate qualified leads', about: 'Sales orchestrator.', skills: ['CRM', 'Cold Outreach'], soul: 'Every lead is a possibility.' },
  { id: 'pulse', name: 'Pulse', role: 'Outbound Scout', specialty: 'Prospecting', status: 'idle', avatar: '🎯', color: '#ec4899', goal: 'Discover new prospects', about: 'Proactive scout.', skills: ['Prospecting', 'Cold Email'], soul: 'Im always hunting.' },
  { id: 'hunter', name: 'Hunter', role: 'Cold Outreach', specialty: 'Calling', status: 'idle', avatar: '🏹', color: '#ef4444', goal: 'Book meetings', about: 'Specialist in cold outreach.', skills: ['Cold Calling'], soul: 'I never take no for an answer.' },
  { id: 'phoenix', name: 'Phoenix', role: 'Warm Leads', specialty: 'Conversion', status: 'idle', avatar: '🔥', color: '#f97316', goal: 'Convert to demos', about: 'Lead converter.', skills: ['Nurturing', 'Demo Booking'], soul: 'I turn spark into flame.' },
  { id: 'scout', name: 'Scout', role: 'Research Lead', specialty: 'Analysis', status: 'idle', avatar: '🔬', color: '#8b5cf6', goal: 'Find opportunities', about: 'Research orchestrator.', skills: ['Market Analysis'], soul: 'Knowledge is power.' },
  { id: 'radar', name: 'Radar', role: 'SEO Specialist', specialty: 'Rankings', status: 'idle', avatar: '🔍', color: '#84cc16', goal: 'Rank #1', about: 'SEO expert.', skills: ['Keyword Research'], soul: 'I make visibility happen.' },
  { id: 'compass', name: 'Compass', role: 'Competitor', specialty: 'Monitoring', status: 'idle', avatar: '🧭', color: '#14b8a6', goal: 'Find gaps', about: 'Competitor specialist.', skills: ['Gap Analysis'], soul: 'I watch the landscape.' },
  { id: 'trends', name: 'Trends', role: 'Market', specialty: 'Trends', status: 'idle', avatar: '📈', color: '#f59e0b', goal: 'Spot trends', about: 'Trend analyst.', skills: ['Trend Analysis'], soul: 'The future belongs to those who see it first.' },
  { id: 'bond', name: 'Bond', role: 'Retention', specialty: 'Churn', status: 'idle', avatar: '🛡️', color: '#3b82f6', goal: 'No churn', about: 'Customer success.', skills: ['Relationship Management'], soul: 'I keep what matters most.' },
  { id: 'anchor', name: 'Anchor', role: 'Accounts', specialty: 'Key accounts', status: 'idle', avatar: '⚓', color: '#0ea5e9', goal: 'Relationships', about: 'Account manager.', skills: ['Account Management'], soul: 'I hold accounts steady.' },
  { id: 'mend', name: 'Mend', role: 'Issues', specialty: 'Resolution', status: 'idle', avatar: '🩹', color: '#f43f5e', goal: 'Fix issues', about: 'Issue resolver.', skills: ['Issue Resolution'], soul: 'I turn pain into loyalty.' },
  { id: 'grow', name: 'Grow', role: 'Expansion', specialty: 'Upsell', status: 'idle', avatar: '🌱', color: '#22c55e', goal: 'Revenue', about: 'Expansion specialist.', skills: ['Upselling'], soul: 'Growth is life.' },
  { id: 'byte', name: 'Byte', role: 'Dev Lead', specialty: 'Build', status: 'idle', avatar: '💻', color: '#22c55e', goal: 'Build', about: 'Development orchestrator.', skills: ['React', 'Node.js'], soul: 'I build what others imagine.' },
  { id: 'pixel', name: 'Pixel', role: 'Frontend', specialty: 'UI', status: 'idle', avatar: '🎨', color: '#06b6d4', goal: 'UIs', about: 'Frontend specialist.', skills: ['React', 'CSS'], soul: 'Beauty meets function.' },
  { id: 'server', name: 'Server', role: 'Backend', specialty: 'APIs', status: 'idle', avatar: '⚙️', color: '#84cc16', goal: 'APIs', about: 'Backend specialist.', skills: ['Node.js'], soul: 'The unseen engine.' },
  { id: 'auto', name: 'Auto', role: 'Automation', specialty: 'Zapier', status: 'idle', avatar: '🤖', color: '#a855f7', goal: 'Automate', about: 'Automation specialist.', skills: ['Zapier'], soul: 'Why do manually?' },
  { id: 'ink', name: 'Ink', role: 'Writer', specialty: 'Blogs', status: 'idle', avatar: '✍️', color: '#f59e0b', goal: 'Content', about: 'Content writer.', skills: ['Blog Writing'], soul: 'Words have power.' },
  { id: 'blaze', name: 'Blaze', role: 'Social', specialty: 'Twitter', status: 'idle', avatar: '📱', color: '#ef4444', goal: 'Presence', about: 'Social media specialist.', skills: ['Twitter'], soul: 'I set the world on fire.' },
  { id: 'cinema', name: 'Cinema', role: 'Video', specialty: 'YouTube', status: 'idle', avatar: '🎬', color: '#06b6d4', goal: 'Videos', about: 'Video producer.', skills: ['Video Editing'], soul: 'A thousand words.' },
  { id: 'draft', name: 'Draft', role: 'Email', specialty: 'Newsletters', status: 'idle', avatar: '📧', color: '#a855f7', goal: 'Nurture', about: 'Email marketer.', skills: ['Email Writing'], soul: 'Inboxes are personal.' },
  { id: 'care', name: 'Care', role: 'Support', specialty: 'Tickets', status: 'idle', avatar: '🎧', color: '#f97316', goal: 'Delight', about: 'Support specialist.', skills: ['Ticket Resolution'], soul: 'Every customer deserves to feel heard.' }
];

const workflowColumns = [
  { id: 'pending', label: 'Inbox', color: '#6b7280' },
  { id: 'assigned', label: 'Assigned', color: '#3b82f6' },
  { id: 'processing', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'completed', label: 'Done', color: '#22c55e' }
];

const modalOverlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modalContent: React.CSSProperties = {
  background: '#1a1a1b', borderRadius: '12px', padding: '20px',
  maxWidth: '400px', width: '90%'
};

const inputStyle = (theme: Theme): React.CSSProperties => ({
  width: '100%', padding: '10px', marginBottom: '10px',
  background: theme.background, border: `1px solid ${theme.border}`,
  borderRadius: '6px', color: theme.text, fontSize: '12px'
});

const buttonStyle = (theme: Theme): React.CSSProperties => ({
  padding: '8px 16px', background: theme.accent, border: 'none',
  borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600',
  cursor: 'pointer'
});

const cancelButtonStyle = (theme: Theme): React.CSSProperties => ({
  padding: '8px 16px', background: 'transparent', border: `1px solid ${theme.border}`,
  borderRadius: '6px', color: theme.textSecondary, fontSize: '12px', cursor: 'pointer'
});

export default function Team({ theme }: { theme: Theme }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'medium' });
  const [chatMessage, setChatMessage] = useState('');
  const [chatAgent, setChatAgent] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTasksByStatus = (status: string) => {
    if (status === 'assigned') return tasks.filter(t => t.assignedTo && t.status === 'pending');
    if (status === 'review') return tasks.filter(t => t.status === 'failed');
    return tasks.filter(t => t.status === status);
  };

  const getAgentStatus = (agentId: string) => {
    const activeTasks = tasks.filter(t => t.assignedTo === agentId && (t.status === 'processing' || t.status === 'pending'));
    return activeTasks.length > 0 ? 'working' : 'idle';
  };

  const getAgentTasks = (agentId: string) => {
    return tasks.filter(t => t.assignedTo === agentId).slice(0, 10);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setSending(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo || undefined,
          priority: newTask.priority,
        }),
      });
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium' });
      setShowNewTaskModal(false);
      fetchTasks();
    } catch (e) {
      console.error('Failed to create task:', e);
    }
    setSending(false);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedAgent) return;
    setSending(true);
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[Message to ${selectedAgent.name}]: ${chatMessage}`,
        description: `Direct message from user`,
        assignedTo: selectedAgent.id,
        priority: 'medium',
        metadata: { isDirectMessage: true },
      }),
    });
    setChatMessage('');
    setShowChatModal(false);
    setShowAgentModal(false);
    setSelectedAgent(null);
    fetchTasks();
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setSending(true);
    
    const message = broadcastMessage;
    setBroadcastMessage('');
    setShowBroadcastModal(false);
    
    // Create ONE task for Neo - Neo will orchestrate everything
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: message,
          description: message,
          assignedTo: 'neo',
          priority: 'high',
          metadata: {
            isOrchestration: true,
            originalMessage: message
          }
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`📢 Broadcast received!\n\nNeo is now orchestrating the task:\n\n"${message}"\n\nNeo will coordinate all subagents, monitor progress, and deliver the final result.\n\nCheck the workflow to see progress.`);
      }
    } catch (err) {
      console.error('Failed to create orchestration task:', err);
    }
    
    // Refresh tasks
    fetchTasks();
    setSending(false);
  };

  const openAgentModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentModal(true);
  };

  const getAgent = (id: string) => allAgents.find(a => a.id === id);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      {/* LEFT COLUMN - Agents */}
      <div style={{ width: '260px', borderRight: `1px solid ${theme.border}`, padding: '12px', overflowY: 'auto', background: theme.surface, flexShrink: 0, height: '100%' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Agents ({allAgents.length})</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {allAgents.map(agent => {
            const status = getAgentStatus(agent.id);
            const agentTasks = tasks.filter(t => t.assignedTo === agent.id && t.status !== 'completed');
            
            return (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: theme.background, borderRadius: '6px', cursor: 'pointer' }}>
                <div style={{ fontSize: '18px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${agent.color}20`, borderRadius: '4px' }}>
                  {agent.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                  <div style={{ fontSize: '10px', color: theme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.specialty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {agentTasks.length > 0 && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '8px', background: '#f59e0b20', color: '#f59e0b' }}>{agentTasks.length}</span>}
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'working' ? '#22c55e' : '#6b7280' }} />
                  <button onClick={(e) => { e.stopPropagation(); openAgentModal(agent); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px', color: theme.textSecondary }} title="Info">ℹ️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN - Workflow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', padding: '12px', borderBottom: `1px solid ${theme.border}`, background: theme.surface }}>
          <button onClick={() => setShowNewTaskModal(true)} style={{ padding: '8px 16px', background: theme.accent, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>➕ New Task</button>
          <button onClick={() => setShowChatModal(true)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>💬 Chat</button>
          <button onClick={() => setShowBroadcastModal(true)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>📢 Broadcast</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span style={{ color: '#f59e0b' }}>⏳ {tasks.filter(t => t.status === 'pending').length}</span>
            <span style={{ color: '#3b82f6' }}>⚙️ {tasks.filter(t => t.status === 'processing').length}</span>
            <span style={{ color: '#22c55e' }}>✅ {tasks.filter(t => t.status === 'completed').length}</span>
            <span style={{ color: '#ef4444' }}>❌ {tasks.filter(t => t.status === 'failed').length}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '8px', padding: '10px', minHeight: 0 }}>
          {workflowColumns.map(col => {
            const colTasks = getTasksByStatus(col.id);
            return (
              <div key={col.id} style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', background: theme.background, borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
                <div style={{ padding: '10px 12px', background: theme.surface, borderBottom: `2px solid ${col.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>{col.label}</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', background: `${col.color}20`, color: col.color }}>{colTasks.length}</span>
                </div>
                <div style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
                  {colTasks.map(task => {
                    const agent = task.assignedTo ? getAgent(task.assignedTo) : null;
                    return (
                      <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {agent && <span style={{ fontSize: '10px', color: agent.color }}>{agent.avatar} {agent.name}</span>}
                          <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '3px', background: task.priority === 'high' ? '#ef444420' : task.priority === 'medium' ? '#f59e0b20' : '#22c55e20', color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e' }}>{task.priority}</span>
                        </div>
                        {task.status === 'completed' && <div style={{ fontSize: '9px', color: '#22c55e', marginTop: '4px' }}>✓ Completed</div>}
                        {task.status === 'failed' && task.error && <div style={{ fontSize: '9px', color: '#ef4444', marginTop: '4px' }}>❌ {task.error}</div>}
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <div style={{ textAlign: 'center', padding: '16px', color: theme.textSecondary, fontSize: '11px' }}>No tasks</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Modal */}
      {showAgentModal && selectedAgent && (
        <div style={modalOverlay} onClick={() => { setShowAgentModal(false); setSelectedAgent(null); }}>
          <div style={{ ...modalContent, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${selectedAgent.color}20`, borderRadius: '12px' }}>{selectedAgent.avatar}</div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, margin: 0 }}>{selectedAgent.name}</h2>
                <div style={{ fontSize: '13px', color: theme.textSecondary }}>{selectedAgent.role} - {selectedAgent.specialty}</div>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: getAgentStatus(selectedAgent.id) === 'working' ? '#22c55e20' : '#6b728020', color: getAgentStatus(selectedAgent.id) === 'working' ? '#22c55e' : theme.textSecondary }}>{getAgentStatus(selectedAgent.id) === 'working' ? '🟢 Working' : '⚪ Idle'}</span>
              </div>
              <button onClick={() => { setShowAgentModal(false); setSelectedAgent(null); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textSecondary }}>×</button>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '4px', textTransform: 'uppercase' }}>About</div>
              <div style={{ fontSize: '13px', color: theme.text }}>{selectedAgent.about}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px', textTransform: 'uppercase' }}>Goal</div>
              <div style={{ fontSize: '13px', color: selectedAgent.color }}>{selectedAgent.goal}</div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px', textTransform: 'uppercase' }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedAgent.skills.map(skill => <span key={skill} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: theme.background, color: theme.text }}>{skill}</span>)}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>Tasks ({getAgentTasks(selectedAgent.id).length})</div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {getAgentTasks(selectedAgent.id).map(task => (
                  <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} style={{ padding: '8px', background: theme.background, borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: task.status === 'completed' ? '#22c55e' : task.status === 'failed' ? '#ef4444' : task.status === 'processing' ? '#3b82f6' : '#f59e0b' }}>{task.status === 'completed' ? '✅' : task.status === 'failed' ? '❌' : task.status === 'processing' ? '⚙️' : '⏳'}</span>
                      <span style={{ color: theme.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                    </div>
                  </div>
                ))}
                {getAgentTasks(selectedAgent.id).length === 0 && <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'center', padding: '8px' }}>No tasks yet</div>}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>Send Message</div>
              <textarea placeholder={`Message to ${selectedAgent.name}...`} value={chatMessage} onChange={e => setChatMessage(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '8px', background: theme.background, border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.text, fontSize: '12px', minHeight: '60px', resize: 'vertical' }} />
              <button onClick={handleSendMessage} disabled={!chatMessage.trim() || sending} style={{ width: '100%', padding: '10px', background: theme.accent, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: chatMessage.trim() && !sending ? 'pointer' : 'not-allowed', opacity: chatMessage.trim() && !sending ? 1 : 0.5 }}>{sending ? 'Sending...' : `Send to ${selectedAgent.name}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div style={modalOverlay} onClick={() => setShowNewTaskModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Create New Task</h3>
            <input type="text" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={inputStyle(theme)} />
            <textarea placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} style={{ ...inputStyle(theme), minHeight: '60px', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <select value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} style={{ ...inputStyle(theme), flex: 1 }}>
                <option value="">Auto-assign</option>
                {allAgents.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
              </select>
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ ...inputStyle(theme), width: '100px' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCreateTask} disabled={sending} style={buttonStyle(theme)}>{sending ? 'Creating...' : 'Create'}</button>
              <button onClick={() => setShowNewTaskModal(false)} style={cancelButtonStyle(theme)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div style={modalOverlay} onClick={() => setShowChatModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Chat with Agent</h3>
            <select value={chatAgent} onChange={e => setChatAgent(e.target.value)} style={inputStyle(theme)}>
              <option value="">Select agent...</option>
              {allAgents.map(a => <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>)}
            </select>
            <textarea placeholder="Message..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} style={{ ...inputStyle(theme), minHeight: '80px', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { const agent = allAgents.find(a => a.id === chatAgent); if (agent) { setSelectedAgent(agent); setShowChatModal(false); setShowAgentModal(true); } }} disabled={!chatAgent || !chatMessage.trim()} style={{ ...buttonStyle(theme), opacity: !chatAgent || !chatMessage.trim() ? 0.5 : 1 }}>Send</button>
              <button onClick={() => setShowChatModal(false)} style={cancelButtonStyle(theme)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div style={modalOverlay} onClick={() => setShowBroadcastModal(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Broadcast to All Agents</h3>
            <textarea placeholder="Broadcast message..." value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} style={{ ...inputStyle(theme), minHeight: '80px', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleBroadcast} disabled={sending} style={buttonStyle(theme)}>{sending ? 'Broadcasting...' : 'Broadcast'}</button>
              <button onClick={() => setShowBroadcastModal(false)} style={cancelButtonStyle(theme)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div style={modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div style={{ ...modalContent, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>{selectedTask.title}</h3>
            <div style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '10px' }}>
              Status: <span style={{ color: selectedTask.status === 'completed' ? '#22c55e' : selectedTask.status === 'failed' ? '#ef4444' : '#3b82f6' }}>{selectedTask.status}</span>
              {' '} | Priority: {selectedTask.priority} | Created: {new Date(selectedTask.createdAt).toLocaleString()}
            </div>
            {selectedTask.description && <p style={{ fontSize: '12px', color: theme.text, marginBottom: '10px' }}>{selectedTask.description}</p>}
            
            {/* Show detailed summary for completed tasks */}
            {selectedTask.result?.summary && (
              <div style={{ marginBottom: '12px' }}>
                {/* Overview */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600', marginBottom: '4px' }}>✓ {selectedTask.result.summary.overview}</div>
                </div>
                
                {/* Actions */}
                {selectedTask.result.summary.actions?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', color: theme.textSecondary, marginBottom: '3px', textTransform: 'uppercase' }}>Actions Taken</div>
                    {selectedTask.result.summary.actions.map((action: string, i: number) => (
                      <div key={i} style={{ fontSize: '11px', color: theme.text, marginLeft: '8px', marginBottom: '2px' }}>• {action}</div>
                    ))}
                  </div>
                )}
                
                {/* Results */}
                {selectedTask.result.summary.results?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', color: theme.textSecondary, marginBottom: '3px', textTransform: 'uppercase' }}>Results</div>
                    {selectedTask.result.summary.results.map((r: string, i: number) => (
                      <div key={i} style={{ fontSize: '11px', color: '#22c55e', marginLeft: '8px', marginBottom: '2px' }}>✓ {r}</div>
                    ))}
                  </div>
                )}
                
                {/* Outputs/Deliverables */}
                {selectedTask.result.summary.outputs?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '9px', color: theme.textSecondary, marginBottom: '3px', textTransform: 'uppercase' }}>Deliverables</div>
                    {selectedTask.result.summary.outputs.slice(0, 4).map((out: any, i: number) => (
                      <div key={i} style={{ fontSize: '11px', marginLeft: '8px', marginBottom: '3px' }}>
                        {out.type === 'deliverable' ? (
                          <span style={{ color: '#3b82f6', cursor: 'pointer' }}>📄 {out.label}</span>
                        ) : out.type === 'link' || out.type === 'issue' ? (
                          <a href={out.value} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>🔗 {out.label}</a>
                        ) : (
                          <span style={{ color: theme.text }}>{out.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Metrics */}
                {selectedTask.result.summary.metrics?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {selectedTask.result.summary.metrics.map((m: any, i: number) => (
                      <span key={i} style={{ fontSize: '9px', padding: '3px 6px', background: theme.background, borderRadius: '3px', color: theme.textSecondary }}>
                        {m.label}: <strong style={{ color: theme.text }}>{m.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Next Steps */}
                {selectedTask.result.summary.nextSteps?.length > 0 && (
                  <div style={{ paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: '9px', color: '#f59e0b', marginBottom: '3px', textTransform: 'uppercase' }}>Next Steps</div>
                    {selectedTask.result.summary.nextSteps.map((step: string, i: number) => (
                      <div key={i} style={{ fontSize: '11px', color: theme.text, marginLeft: '8px' }}>→ {step}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Show raw result if no summary (fallback) */}
            {selectedTask.result && !selectedTask.result.summary && (
              <div style={{ background: theme.background, borderRadius: '6px', padding: '10px', maxHeight: '150px', overflow: 'auto', fontSize: '10px', fontFamily: 'monospace' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: theme.text }}>{JSON.stringify(selectedTask.result, null, 2)}</pre>
              </div>
            )}
            {selectedTask.error && <div style={{ marginTop: '10px', padding: '10px', background: '#ef444420', borderRadius: '6px', fontSize: '11px', color: '#ef4444' }}>Error: {selectedTask.error}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => {
                  if (confirm('Delete this task?')) {
                    fetch(`/api/tasks?id=${selectedTask.id}`, { method: 'DELETE' })
                      .then(() => {
                        setTasks(tasks.filter(t => t.id !== selectedTask.id));
                        setShowTaskModal(false);
                      })
                      .catch(err => console.error('Delete failed:', err));
                  }
                }} 
                style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                🗑️ Delete Task
              </button>
              <button onClick={() => setShowTaskModal(false)} style={{ ...cancelButtonStyle(theme), flex: 1, width: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
