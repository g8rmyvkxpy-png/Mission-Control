'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignedTo?: string;
  agent_name?: string;
  agent_avatar?: string;
  result?: any;
  error?: string;
  createdAt?: number;
  completedAt?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, pending: 0, failed: 0 });

  const loadTasks = async () => {
    try {
      // Fetch from Supabase
      const res = await fetch('/api/tasks-supabase');
      const data = await res.json();
      const taskList = data.tasks || [];
      setTasks(taskList);
      
      setStats({
        total: taskList.length,
        completed: taskList.filter((t: Task) => t.status === 'completed' || t.status === 'done').length,
        processing: taskList.filter((t: Task) => t.status === 'processing' || t.status === 'in_progress').length,
        pending: taskList.filter((t: Task) => t.status === 'pending' || t.status === 'assigned').length,
        failed: taskList.filter((t: Task) => t.status === 'failed').length,
      });
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('auto_execute', 'true');
      formData.append('organization_id', '56b94071-3455-4967-9300-60788486a4fb');

      const response = await fetch('/api/tasks/auto', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Created: "${data.task.title}" - ${data.task.agent_name} is working on it!`);
        setTitle('');
        loadTasks();
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      setMessage('❌ Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks-supabase?id=${taskId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadTasks();
        if (selectedTask?.id === taskId) setSelectedTask(null);
      }
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#3fb950',
      done: '#3fb950',
      processing: '#2f81f7',
      in_progress: '#2f81f7',
      pending: '#d29922',
      assigned: '#d29922',
      failed: '#f85149',
      review: '#a371f7'
    };
    return colors[status] || '#8b949e';
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => {
        if (filter === 'active') return t.status === 'pending' || t.status === 'processing' || t.status === 'in_progress';
        if (filter === 'completed') return t.status === 'completed' || t.status === 'done';
        return t.status === filter;
      });

  const filterButtons = [
    { key: 'all', label: 'All', count: stats.total, color: '#8b949e' },
    { key: 'active', label: 'Active', count: stats.pending + stats.processing, color: '#2f81f7' },
    { key: 'completed', label: 'Done', count: stats.completed, color: '#3fb950' },
    { key: 'failed', label: 'Failed', count: stats.failed, color: '#f85149' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f0f6fc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '24px 24px 24px', maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Tasks ⚡</h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Create tasks and watch AI agents work on them</p>
        </div>

        {/* Create Task */}
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #21262d' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Create New Task</h2>
          <form onSubmit={createTask}>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need? (e.g., 'Add a contact form to my website')" 
              style={{ width: '100%', padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} 
              required 
            />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  padding: '12px 24px', 
                  background: loading ? '#30363d' : '#2f81f7', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  fontSize: 14, 
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Creating...' : '🚀 Create Task'}
              </button>
              {message && (
                <span style={{ color: message.includes('✅') ? '#3fb950' : '#f85149', fontSize: 14 }}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Stats & Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              style={{
                background: filter === btn.key ? `${btn.color}20` : '#0f1117',
                border: `1px solid ${filter === btn.key ? btn.color : '#21262d'}`,
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, color: btn.color, marginBottom: 4, textTransform: 'uppercase' }}>{btn.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: btn.color }}>{btn.count}</div>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, border: '1px solid #21262d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              {filter === 'all' ? 'All Tasks' : filter === 'active' ? 'Active Tasks' : filter === 'completed' ? 'Completed' : 'Failed'}
              <span style={{ color: '#8b949e', fontWeight: 400, marginLeft: 8 }}>({filteredTasks.length})</span>
            </h2>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#8b949e' }}>
              No tasks in this category. Create your first task above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px', 
                    background: selectedTask?.id === task.id ? '#1a1f2e' : '#030712', 
                    borderRadius: 8,
                    border: '1px solid #21262d'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                      <div style={{ fontSize: 12, color: '#8b949e' }}>
                        {task.agent_name && `${task.agent_avatar || ''} ${task.agent_name}`}
                        {task.createdAt && ` • ${formatTime(task.createdAt)}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        fontSize: 11, 
                        fontWeight: 600, 
                        background: `${getStatusColor(task.status)}20`, 
                        color: getStatusColor(task.status),
                        textTransform: 'uppercase'
                      }}>
                        {task.status}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#f85149', 
                          cursor: 'pointer',
                          fontSize: 16,
                          padding: 4
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Result */}
                  {selectedTask?.id === task.id && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #21262d' }}>
                      {task.error && (
                        <div style={{ color: '#f85149', fontSize: 14 }}>Error: {task.error}</div>
                      )}
                      
                      {task.result && (
                        <div>
                          {task.result.summary?.overview && (
                            <div style={{ background: '#0f1117', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, marginBottom: 4 }}>Overview</div>
                              <div style={{ fontSize: 14, color: '#c9d1d9' }}>{task.result.summary.overview}</div>
                            </div>
                          )}
                          
                          {task.result.summary?.actions && task.result.summary.actions.length > 0 && (
                            <div style={{ background: '#0f1117', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>Actions Taken</div>
                              {task.result.summary.actions.map((action: string, i: number) => (
                                <div key={i} style={{ fontSize: 13, color: '#8b949e', marginBottom: 4 }}>• {action}</div>
                              ))}
                            </div>
                          )}
                          
                          {task.result.summary?.results && task.result.summary.results.length > 0 && (
                            <div style={{ background: '#0f1117', padding: 12, borderRadius: 8 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>Results</div>
                              {task.result.summary.results.map((result: string, i: number) => (
                                <div key={i} style={{ fontSize: 13, color: '#3fb950', marginBottom: 4 }}>✓ {result}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
