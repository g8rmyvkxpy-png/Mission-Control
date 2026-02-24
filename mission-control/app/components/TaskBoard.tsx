'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'pending' | 'in_progress' | 'processing' | 'completed' | 'failed' | 'done';
  assignee: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  result?: any;
  error?: string;
}

interface Agent {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
}

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
}

const darkTheme: Theme = {
  background: '#0a0a0b',
  surface: '#111113',
  border: '#27272a',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  accent: '#f97316',
  accentHover: '#ea580c',
};

const lightTheme: Theme = {
  background: '#fafafa',
  surface: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  textSecondary: '#71717a',
  accent: '#f97316',
  accentHover: '#ea580c',
};

const columns = [
  { id: 'todo', label: 'To Do', color: '#ef4444' },
  { id: 'pending', label: 'Pending', color: '#f59e0b' },
  { id: 'in_progress', label: 'Processing', color: '#3b82f6' },
  { id: 'done', label: 'Done', color: '#22c55e' },
  { id: 'failed', label: 'Failed', color: '#dc2626' },
];

export default function TaskBoard({ theme }: { theme: Theme }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [queueStatus, setQueueStatus] = useState<any>({});
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    assignee: 'Neo',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [showAdd, setShowAdd] = useState(false);
  const [showResults, setShowResults] = useState<string | null>(null);

  const currentTheme = theme;

  useEffect(() => {
    loadTasks();
    loadAgents();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      
      // Map task statuses
      const mappedTasks = (data.tasks || []).map((t: any) => ({
        ...t,
        status: t.status === 'processing' ? 'in_progress' : 
                t.status === 'completed' ? 'done' : 
                t.status === 'pending' ? 'pending' : 'todo',
        createdAt: t.createdAt
      }));
      
      setTasks(mappedTasks);
      setQueueStatus(data.queueStatus || {});
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks }),
      });
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo || undefined,
          priority: newTask.priority,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Reload tasks to get the actual status from queue
        loadTasks();
      }
    } catch (e) {
      console.error('Failed to add task:', e);
    }
    
    setNewTask({ title: '', description: '', assignee: 'Neo', assignedTo: '', priority: 'medium' });
    setShowAdd(false);
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    // Map UI status back to queue status
    const statusMap: Record<string, string> = {
      'todo': 'pending',
      'pending': 'pending',
      'in_progress': 'processing',
      'done': 'completed'
    };
    
    const queueStatus = statusMap[newStatus];
    
    if (queueStatus === 'pending') {
      // Retry failed task
      try {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, action: 'retry' }),
        });
        loadTasks();
      } catch (e) {
        console.error('Failed to retry task:', e);
      }
    }
  };

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId));
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'Unassigned';
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.avatar} ${agent.name}` : agentId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#71717a';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Queue Status Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '12px 16px',
        background: currentTheme.surface,
        borderRadius: '8px',
        border: `1px solid ${currentTheme.border}`,
        fontSize: '12px'
      }}>
        <div style={{ color: currentTheme.textSecondary }}>Queue:</div>
        <div style={{ color: '#ef4444' }}>⏳ {queueStatus.pending || 0} pending</div>
        <div style={{ color: '#3b82f6' }}>⚙️ {queueStatus.processing || 0} processing</div>
        <div style={{ color: '#22c55e' }}>✅ {queueStatus.completed || 0} completed</div>
        <div style={{ color: '#ef4444' }}>❌ {queueStatus.failed || 0} failed</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.text }}>Tasks</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '10px 20px',
            background: currentTheme.accent,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Add Task
        </button>
      </div>

      {showAdd && (
        <div style={{
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              color: currentTheme.text,
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              color: currentTheme.text,
              fontSize: '14px',
              marginBottom: '12px',
              minHeight: '80px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {/* Priority */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>Priority:</span>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                style={{
                  padding: '8px 12px',
                  background: currentTheme.background,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  color: currentTheme.text,
                  fontSize: '14px',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            {/* Assign to Agent */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>Assign to:</span>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                style={{
                  padding: '8px 12px',
                  background: currentTheme.background,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  color: currentTheme.text,
                  fontSize: '14px',
                  minWidth: '150px',
                }}
              >
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.avatar} {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addTask}
              style={{
                padding: '10px 20px',
                background: currentTheme.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                color: currentTheme.textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {columns.map(col => (
          <div key={col.id}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${col.color}`,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: currentTheme.text }}>
                {col.label}
              </span>
              <span style={{ fontSize: '12px', color: currentTheme.textSecondary, marginLeft: 'auto' }}>
                {getTasksByStatus(col.id).length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getTasksByStatus(col.id).map(task => (
                <div
                  key={task.id}
                  style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: currentTheme.text, margin: 0, flex: 1 }}>
                      {task.title}
                    </h4>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: currentTheme.textSecondary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0',
                        marginLeft: '8px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {task.description && (
                    <p style={{ fontSize: '12px', color: currentTheme.textSecondary, marginBottom: '12px' }}>
                      {task.description}
                    </p>
                  )}
                  
                  {/* Show result/error for completed/failed tasks */}
                  {(task.status === 'done' || task.status === 'failed') && task.result && (
                    <div 
                      onClick={() => setShowResults(showResults === task.id ? null : task.id)}
                      style={{
                        fontSize: '11px',
                        padding: '8px',
                        background: task.status === 'failed' ? '#ef444420' : '#22c55e20',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        cursor: 'pointer',
                        color: task.status === 'failed' ? '#ef4444' : '#22c55e',
                      }}
                    >
                      {task.status === 'failed' ? `❌ ${task.error || 'Failed'}` : '✅ Completed'}
                      {showResults === task.id && task.result && (
                        <pre style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          background: currentTheme.background, 
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '10px',
                          color: currentTheme.text
                        }}>
                          {JSON.stringify(task.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* Priority badge */}
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${getPriorityColor(task.priority)}20`,
                        color: getPriorityColor(task.priority),
                        textTransform: 'uppercase',
                        fontWeight: '600',
                      }}>
                        {task.priority}
                      </span>
                      
                      {/* Agent badge */}
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#8b5cf620',
                        color: '#8b5cf6',
                      }}>
                        {getAgentName(task.assignedTo)}
                      </span>
                    </div>
                    
                    {task.status === 'failed' && (
                      <button
                        onClick={() => moveTask(task.id, 'pending')}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          background: currentTheme.accent,
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {getTasksByStatus(col.id).length === 0 && (
                <p style={{ fontSize: '12px', color: currentTheme.textSecondary, textAlign: 'center', padding: '20px' }}>
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
