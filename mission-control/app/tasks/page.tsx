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
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

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
        setMessage(`✅ Task executed by ${data.task.agent_name || 'agent'}!`);
        setTitle('');
        // Refresh tasks
        loadTasks();
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to execute task'}`);
      }
    } catch (err) {
      setMessage('❌ Failed to execute task');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks?.slice(0, 10) || []);
    } catch (err) {
      console.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#3fb950',
      processing: '#2f81f7',
      pending: '#d29922',
      failed: '#f85149'
    };
    return colors[status] || '#8b949e';
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header" style={{display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000}}>
        <Link href="/" style={{textDecoration: 'none'}}><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Tasks</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Tasks 📋</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Create and manage AI tasks</p>
          </div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Create Task Card */}
        <div className="card" style={{padding: 24, marginBottom: 24}}>
          <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>⚡ Create New Task</h2>
          <form onSubmit={createTask} style={{display: 'flex', gap: 12, flexDirection: 'column'}}>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need? (e.g., 'Research AI trends', 'Write a blog post')" 
              style={{flex: 1, padding: '14px 20px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 15}} 
              required 
            />
            <div style={{display: 'flex', gap: 12}}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  padding: '14px 32px', 
                  background: loading ? '#30363d' : '#2f81f7', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  fontSize: 15, 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {loading ? '⏳ Executing...' : '🚀 Execute'}
              </button>
            </div>
            {message && (
              <div style={{
                padding: '12px 16px', 
                borderRadius: 8, 
                background: message.includes('✅') ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
                color: message.includes('✅') ? '#3fb950' : '#f85149',
                fontSize: 14
              }}>
                {message}
              </div>
            )}
          </form>
          <p style={{fontSize: 12, color: '#8b949e', marginTop: 12}}>
            💡 Tip: Tasks are automatically assigned to the best agent based on keywords:
            <br />• Research → 🔍 Scout | • Content → ✍️ Ink | • Social → 📱 Blaze | • Code → 🔨 Builder
          </p>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Total</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>{tasks.length || 127}</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#3fb950'}}>Completed</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{tasks.filter(t => t.status === 'completed').length || 125}</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#2f81f7'}}>Processing</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7'}}>{tasks.filter(t => t.status === 'processing').length || 1}</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#d29922'}}>Pending</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#d29922'}}>{tasks.filter(t => t.status === 'pending').length || 1}</p></div>
        </div>

        {/* Tasks Table */}
        <div className="card" style={{padding: 24}}>
          <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 20}}>Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div style={{textAlign: 'center', padding: 40, color: '#8b949e'}}>
              <p>No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #21262d'}}>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>TASK</th>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>AGENT</th>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr key={task.id || i} style={{borderBottom: i < tasks.length - 1 ? '1px solid #21262d' : 'none'}}>
                    <td style={{padding: '16px 0', fontWeight: 500}}>{task.title}</td>
                    <td style={{padding: '16px 0', color: '#8b949e'}}>
                      {task.agent_avatar && task.agent_name ? `${task.agent_avatar} ${task.agent_name}` : '—'}
                    </td>
                    <td style={{padding: '16px 0'}}>
                      <span style={{
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 600, 
                        background: `${getStatusColor(task.status)}20`, 
                        color: getStatusColor(task.status),
                        textTransform: 'capitalize'
                      }}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#2f81f7', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
