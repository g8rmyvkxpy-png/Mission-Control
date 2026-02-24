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

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  from: string;
  to?: string;
  timestamp: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done';
  createdAt: number;
}

const agents: Agent[] = [
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
  { id: 'inbox', label: 'Inbox', color: '#6b7280' },
  { id: 'assigned', label: 'Assigned', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#22c55e' }
];

const STORAGE_KEYS = { tasks: 'mc_tasks', activities: 'mc_activities', lastCheckin: 'mc_last_checkin' };

export default function Team({ theme }: { theme: Theme }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60);

  // Load from localStorage on mount only
  useEffect(() => {
    // Load tasks
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.tasks);
      if (saved) setTasks(JSON.parse(saved));
    } catch {}
    
    // Load activities
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.activities);
      if (saved) setActivities(JSON.parse(saved));
    } catch {}
    
    // Load checkin time
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.lastCheckin);
      if (saved) {
        const last = parseInt(saved);
        const elapsed = Math.floor((Date.now() - last) / 1000);
        const remaining = (15 * 60) - (elapsed % (15 * 60));
        setTimeRemaining(remaining > 0 ? remaining : 15 * 60);
      }
    } catch {}
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities)); } catch {}
  }, [activities]);

  // Timer - saves start time to localStorage
  useEffect(() => {
    // On mount, check if we have a valid start time
    const saved = localStorage.getItem(STORAGE_KEYS.lastCheckin);
    if (saved) {
      const startTime = parseInt(saved);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const cycleTime = 15 * 60;
      const remaining = cycleTime - (elapsed % cycleTime);
      setTimeRemaining(remaining > 0 ? remaining : cycleTime);
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          // Timer reset - save new start time
          try { localStorage.setItem(STORAGE_KEYS.lastCheckin, Date.now().toString()); } catch {}
          return 15 * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return m + ':' + s.toString().padStart(2, '0'); };
  const getRecentActivities = () => activities.filter(a => a.timestamp > Date.now() - (15 * 60 * 1000));
  const getAgent = (id: string) => agents.find(a => a.id === id);
  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || id;

  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('');
  const [editTaskAssignee, setEditTaskAssignee] = useState('');
  const [infoAgent, setInfoAgent] = useState<Agent | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatAgent, setChatAgent] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestingAgent, setSuggestingAgent] = useState('');
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDesc, setDeliverableDesc] = useState('');
  const [deliverableAssign, setDeliverableAssign] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = { id: Date.now().toString(), title: newTaskTitle, description: newTaskDesc, assignedTo: newTaskAssignee || undefined, status: newTaskAssignee ? 'assigned' : 'inbox', createdAt: Date.now() };
      setTasks([...tasks, newTask]);
      setActivities([...activities, { id: Date.now().toString(), type: 'task', title: newTaskTitle, description: newTaskDesc, from: 'neo', timestamp: Date.now() }]);
      setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskAssignee(''); setShowNewTaskModal(false);
    }
  };

  const handleSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestionText.trim() && suggestingAgent) {
      setActivities([...activities, { id: Date.now().toString(), type: 'suggestion', title: 'New Suggestion', description: suggestionText, from: suggestingAgent, timestamp: Date.now() }]);
      setSuggestionText(''); setSuggestingAgent(''); setShowSuggestModal(false);
    }
  };

  const handleDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliverableTitle.trim()) {
      setActivities([...activities, { id: Date.now().toString(), type: 'deliverable', title: deliverableTitle, description: deliverableDesc, from: 'neo', to: deliverableAssign || undefined, timestamp: Date.now() }]);
      if (deliverableAssign) { setTasks([...tasks, { id: Date.now().toString(), title: deliverableTitle, description: deliverableDesc, assignedTo: deliverableAssign, status: 'assigned', createdAt: Date.now() }]); }
      setDeliverableTitle(''); setDeliverableDesc(''); setDeliverableAssign(''); setShowDeliverableModal(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim() && chatAgent) {
      setActivities([...activities, { id: Date.now().toString(), type: 'update', title: 'Message', description: chatMessage, from: 'neo', to: chatAgent, timestamp: Date.now() }]);
      setChatMessage(''); setChatAgent(''); setShowChatModal(false);
    }
  };

  const recentActivities = getRecentActivities();

  return (
    <div style={{ padding: '16px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '2px' }}>Agent Squad</h2>
          <p style={{ fontSize: '11px', color: theme.textSecondary }}><span style={{ color: '#22c55e', fontWeight: '600' }}>Goal:</span> $1M revenue | <span style={{ color: theme.accent, marginLeft: '8px' }}>Check-in: {formatTime(timeRemaining)}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setShowSuggestModal(true)} style={{ padding: '6px 10px', background: '#8b5cf6', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Suggest</button>
          <button onClick={() => setShowDeliverableModal(true)} style={{ padding: '6px 10px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Deliverable</button>
          <button onClick={() => setShowNewTaskModal(true)} style={{ padding: '6px 10px', background: theme.accent, border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>+ Task</button>
          <button onClick={() => setShowChatModal(true)} style={{ padding: '6px 10px', background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '4px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Chat</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '12px', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>Agents ({agents.length})</h3>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {agents.map(agent => (
              <div key={agent.id} onMouseEnter={() => setHoveredAgent(agent.id)} onMouseLeave={() => setHoveredAgent(null)} onClick={() => { setInfoAgent(agent); setShowInfoModal(true); }} style={{ background: theme.surface, border: '1px solid ' + (hoveredAgent === agent.id ? theme.accent : theme.border), borderRadius: '6px', padding: '6px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: agent.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{agent.avatar}</div>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: theme.text }}>{agent.name}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.status !== 'idle' ? '#22c55e' : theme.textSecondary }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>Last 15 min ({recentActivities.length})</h3>
          <div style={{ flex: 1, overflow: 'auto', background: theme.surface, borderRadius: '6px', padding: '8px', border: '1px solid ' + theme.border }}>
            {recentActivities.length === 0 ? <p style={{ fontSize: '10px', color: theme.textSecondary, textAlign: 'center', padding: '20px' }}>No activity</p> : recentActivities.map(act => (
              <div key={act.id} style={{ background: theme.background, borderRadius: '4px', padding: '6px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px' }}>{getAgent(act.from)?.avatar}</span>
                  <span style={{ fontSize: '9px', fontWeight: '600', color: theme.text }}>{getAgentName(act.from)}</span>
                  {act.to && <><span style={{ fontSize: '8px', color: theme.textSecondary }}>→</span><span style={{ fontSize: '10px' }}>{getAgent(act.to)?.avatar}</span></>}
                </div>
                <p style={{ fontSize: '9px', color: theme.text, margin: '2px 0 0' }}>{act.description || act.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>Workflow</h3>
          <div style={{ flex: 1, display: 'flex', gap: '6px', overflow: 'hidden' }}>
            {workflowColumns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} style={{ minWidth: '70px', flex: 1, background: theme.surface, borderRadius: '6px', padding: '6px', border: '1px solid ' + theme.border, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid ' + theme.border }}>
                    <span style={{ fontSize: '9px', fontWeight: '600', color: col.color }}>{col.label}</span>
                    <span style={{ fontSize: '8px', background: theme.background, padding: '0 4px', borderRadius: '6px', color: theme.textSecondary }}>{colTasks.length}</span>
                  </div>
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {colTasks.length === 0 ? <p style={{ fontSize: '8px', color: theme.textSecondary, textAlign: 'center', padding: '6px' }}>Empty</p> : colTasks.map(task => (
                      <div key={task.id} onClick={() => { setSelectedTask(task); setEditTaskTitle(task.title); setEditTaskDesc(task.description); setEditTaskStatus(task.status); setEditTaskAssignee(task.assignedTo || ''); setShowTaskModal(true); }} style={{ background: theme.background, borderRadius: '3px', padding: '4px', marginBottom: '3px', cursor: 'pointer' }}>
                        <p style={{ fontSize: '9px', fontWeight: '500', color: theme.text, margin: 0 }}>{task.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showNewTaskModal && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowNewTaskModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '8px', padding: '16px', width: '280px' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>New Task</h3>
          <form onSubmit={handleCreateTask}>
            <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Description" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', resize: 'none', height: '40px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <select value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '12px', boxSizing: 'border-box' }}>
              <option value="">-- Assign --</option>
              {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setShowNewTaskModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '4px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '8px', background: theme.accent, border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Create</button>
            </div>
          </form>
        </div>
      </div>}

      {showSuggestModal && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowSuggestModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '8px', padding: '16px', width: '300px' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Suggest Idea</h3>
          <form onSubmit={handleSuggestion}>
            <select value={suggestingAgent} onChange={(e) => setSuggestingAgent(e.target.value)} required style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}>
              <option value="">-- Your Name --</option>
              {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>)}
            </select>
            <textarea value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} placeholder="Idea to reach $1M faster..." required style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', resize: 'none', height: '80px', marginBottom: '12px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setShowSuggestModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '4px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '8px', background: '#8b5cf6', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Submit</button>
            </div>
          </form>
        </div>
      </div>}

      {showDeliverableModal && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowDeliverableModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '8px', padding: '16px', width: '300px' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Create Deliverable</h3>
          <form onSubmit={handleDeliverable}>
            <input value={deliverableTitle} onChange={(e) => setDeliverableTitle(e.target.value)} placeholder="Title" required style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <textarea value={deliverableDesc} onChange={(e) => setDeliverableDesc(e.target.value)} placeholder="Description" style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', resize: 'none', height: '60px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <select value={deliverableAssign} onChange={(e) => setDeliverableAssign(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '12px', boxSizing: 'border-box' }}>
              <option value="">-- Assign to --</option>
              {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setShowDeliverableModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '4px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Create</button>
            </div>
          </form>
        </div>
      </div>}

      {showChatModal && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowChatModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '8px', padding: '16px', width: '280px' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Send Message</h3>
          <form onSubmit={handleSendChat}>
            <select value={chatAgent} onChange={(e) => setChatAgent(e.target.value)} required style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}>
              <option value="">-- Select --</option>
              {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>)}
            </select>
            <textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Message..." required style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', resize: 'none', height: '60px', marginBottom: '12px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setShowChatModal(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '4px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '8px', background: theme.accent, border: 'none', borderRadius: '4px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '11px' }}>Send</button>
            </div>
          </form>
        </div>
      </div>}

      {showInfoModal && infoAgent && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowInfoModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '12px', padding: '20px', width: '340px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: infoAgent.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{infoAgent.avatar}</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700',              color: theme.text, margin: 0 }}>{infoAgent.name}</h3>
              <p style={{ fontSize: '12px', color: infoAgent.color, margin: '2px 0 0' }}>{infoAgent.role}</p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '2px' }}>GOAL</p>
          <p style={{ fontSize: '12px', color: theme.text, margin: '0 0 12px' }}>{infoAgent.goal}</p>
          <p style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '2px' }}>SPECIALTY</p>
          <p style={{ fontSize: '12px', color: theme.text, margin: '0 0 12px' }}>{infoAgent.specialty}</p>
          <p style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>SKILLS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {infoAgent.skills.map((skill, i) => <span key={i} style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '4px', background: infoAgent.color + '15', color: infoAgent.color }}>{skill}</span>)}
          </div>
          <p style={{ fontSize: '10px', color: theme.textSecondary, marginBottom: '4px' }}>ABOUT</p>
          <p style={{ fontSize: '11px', color: theme.text, margin: '0 0 12px', lineHeight: '1.4' }}>{infoAgent.about}</p>
          <div style={{ background: infoAgent.color + '10', borderLeft: '3px solid ' + infoAgent.color, padding: '10px', borderRadius: '0 6px 6px 0', marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', color: infoAgent.color, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>SOUL</p>
            <p style={{ fontSize: '11px', color: theme.text, margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>"{infoAgent.soul}"</p>
          </div>
          <button onClick={() => setShowInfoModal(false)} style={{ width: '100%', padding: '10px', background: theme.background, border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Close</button>
        </div>
      </div>}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowTaskModal(false)}>
        <div style={{ background: theme.surface, borderRadius: '12px', padding: '20px', width: '360px' }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Task Details</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '10px', color: theme.textSecondary }}>TITLE</label>
            <input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '10px', color: theme.textSecondary }}>DESCRIPTION</label>
            <textarea value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginTop: '4px', height: '60px', resize: 'none', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: theme.textSecondary }}>STATUS</label>
              <select value={editTaskStatus} onChange={(e) => setEditTaskStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }}>
                {workflowColumns.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: theme.textSecondary }}>ASSIGNED TO</label>
              <select value={editTaskAssignee} onChange={(e) => setEditTaskAssignee(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid ' + theme.border, background: theme.background, color: theme.text, fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }}>
                <option value="">-- Unassigned --</option>
                {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button onClick={() => { setTasks(tasks.filter(t => t.id !== selectedTask.id)); setShowTaskModal(false); }} style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
            <button onClick={() => { setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, title: editTaskTitle, description: editTaskDesc, status: editTaskStatus as Task['status'], assignedTo: editTaskAssignee || undefined } : t)); setShowTaskModal(false); }} style={{ flex: 1, padding: '10px', background: theme.accent, border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Save</button>
          </div>
          <button onClick={() => setShowTaskModal(false)} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontWeight: '600', cursor: 'pointer', fontSize: '12px', marginTop: '8px' }}>Cancel</button>
        </div>
      </div>}
    </div>
  );
}
