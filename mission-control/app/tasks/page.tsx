'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  status: string;
  agent_name?: string;
  agent_avatar?: string;
  result?: string;
  createdAt?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, pending: 0, failed: 0 });

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const taskList = data.tasks || [];
      setTasks(taskList);
      
      // Calculate stats
      setStats({
        total: taskList.length,
        completed: taskList.filter((t: Task) => t.status === 'completed' || t.status === 'done').length,
        processing: taskList.filter((t: Task) => t.status === 'processing').length,
        pending: taskList.filter((t: Task) => t.status === 'pending').length,
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
        setMessage(`✅ Executed by ${data.task.agent_name || 'agent'}!`);
        setTitle('');
        // Refresh tasks
        loadTasks();
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      setMessage('❌ Failed to execute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#3fb950',
      done: '#3fb950',
      processing: '#2f81f7',
      pending: '#d29922',
      failed: '#f85149',
      review: '#a371f7'
    };
    return colors[status] || '#8b949e';
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{minHeight: '100vh', background: '#030712', color: '#f0f6fc', fontFamily: 'Inter, sans-serif', paddingBottom: '80px'}}>
      {/* Mobile Header */}
      <div style={{display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000}}>
        <Link href="/" style={{textDecoration: 'none'}}><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Tasks</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div style={{padding: '80px 24px 24px', maxWidth: 900, margin: '0 auto'}}>
        {/* Header */}
        <div style={{marginBottom: 32}}>
          <h1 style={{fontSize: 32, fontWeight: 700, marginBottom: 8}}>Tasks 📋</h1>
          <p style={{color: '#8b949e', margin: 0}}>Execute AI tasks instantly</p>
        </div>

        {/* Create Task */}
        <div style={{background: '#0f1117', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #21262d'}}>
          <h2 style={{fontSize: 16, fontWeight: 600, marginBottom: 12}}>⚡ New Task</h2>
          <form onSubmit={createTask}>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need? (e.g., 'Research AI trends in Bangalore')" 
              style={{width: '100%', padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14, marginBottom: 12, boxSizing: 'border-box'}} 
              required 
            />
            <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
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
                {loading ? '⏳ Executing...' : '🚀 Execute'}
              </button>
              {message && (
                <span style={{
                  color: message.includes('✅') ? '#3fb950' : '#f85149',
                  fontSize: 14
                }}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24}}>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #21262d'}}>
            <div style={{fontSize: 11, color: '#8b949e', marginBottom: 4}}>TOTAL</div>
            <div style={{fontSize: 24, fontWeight: 700}}>{stats.total}</div>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #21262d'}}>
            <div style={{fontSize: 11, color: '#3fb950', marginBottom: 4}}>DONE</div>
            <div style={{fontSize: 24, fontWeight: 700, color: '#3fb950'}}>{stats.completed}</div>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #21262d'}}>
            <div style={{fontSize: 11, color: '#2f81f7', marginBottom: 4}}>RUNNING</div>
            <div style={{fontSize: 24, fontWeight: 700, color: '#2f81f7'}}>{stats.processing}</div>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #21262d'}}>
            <div style={{fontSize: 11, color: '#d29922', marginBottom: 4}}>PENDING</div>
            <div style={{fontSize: 24, fontWeight: 700, color: '#d29922'}}>{stats.pending}</div>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #21262d'}}>
            <div style={{fontSize: 11, color: '#f85149', marginBottom: 4}}>FAILED</div>
            <div style={{fontSize: 24, fontWeight: 700, color: '#f85149'}}>{stats.failed}</div>
          </div>
        </div>

        {/* Task List */}
        <div style={{background: '#0f1117', borderRadius: 12, padding: 20, border: '1px solid #21262d'}}>
          <h2 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>Recent Tasks</h2>
          
          {tasks.length === 0 ? (
            <div style={{textAlign: 'center', padding: 40, color: '#8b949e'}}>
              No tasks yet. Create your first task above!
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {tasks.slice(0, 20).map((task, i) => (
                <div key={task.id || i} style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 16px', 
                  background: '#030712', 
                  borderRadius: 8,
                  border: '1px solid #21262d'
                }}>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 500, marginBottom: 4}}>{task.title}</div>
                    <div style={{fontSize: 12, color: '#8b949e'}}>
                      {task.agent_name && `${task.agent_avatar || ''} ${task.agent_name}`}
                      {task.createdAt && ` • ${formatTime(task.createdAt)}`}
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#2f81f7', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
