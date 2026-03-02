'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  status: string;
  agent_name?: string;
  agent_avatar?: string;
  createdAt?: number;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', agentId: '' });
  const [creating, setCreating] = useState(false);

  // Fetch real data
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, agentsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/agents')
        ]);
        
        const tasksData = await tasksRes.json();
        const agentsData = await agentsRes.json();
        
        setTasks(tasksData.tasks || []);
        setAgents(agentsData.agents || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }
    
    fetchData();
    setLoading(false);
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          agent_id: newTask.agentId || undefined,
          priority: 'medium',
          status: 'pending'
        })
      });
      
      if (res.ok) {
        const task = await res.json();
        setTasks([task.task, ...tasks]);
        setShowNewTask(false);
        setNewTask({ title: '', description: '', agentId: '' });
      }
    } catch (err) {
      console.error('Failed to create task', err);
    }
    
    setCreating(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#3fb950',
      done: '#3fb950',
      processing: '#2f81f7',
      pending: '#d29922',
      failed: '#f85149'
    };
    return colors[status] || '#8b949e';
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <div>
      {/* Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1117, rgba(47,129,247,0.15))',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        border: '1px solid #21262d'
      }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Welcome back! 👋</h2>
        <p style={{ marginTop: 8, color: '#8b949e' }}>Your AI workforce is running smoothly</p>
      </div>

      {/* Create Task Modal */}
      {showNewTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowNewTask(false)}>
          <div style={{
            background: '#0f1117',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 500,
            border: '1px solid #21262d'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 20 }}>Create New Task</h3>
            <form onSubmit={createTask}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8b949e' }}>Task Title</label>
                <input
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What do you want to accomplish?"
                  style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #21262d', borderRadius: 8, color: '#f0f6fc', fontSize: 14 }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8b949e' }}>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                  style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #21262d', borderRadius: 8, color: '#f0f6fc', fontSize: 14, resize: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8b949e' }}>Assign to Agent (optional)</label>
                <select
                  value={newTask.agentId}
                  onChange={e => setNewTask({ ...newTask, agentId: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#030712', border: '1px solid #21262d', borderRadius: 8, color: '#f0f6fc', fontSize: 14 }}
                >
                  <option value="">Auto-assign</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.avatar} {agent.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowNewTask(false)} style={{ flex: 1, padding: 12, background: '#21262d', border: 'none', borderRadius: 8, color: '#f0f6fc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ flex: 1, padding: 12, background: '#2f81f7', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', opacity: creating ? 0.7 : 1 }}>
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d' }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <p style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>Total Tasks</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 0' }}>{totalTasks}</p>
        </div>
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d' }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <p style={{ fontSize: 12, color: '#3fb950', marginTop: 8 }}>Completed</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 0', color: '#3fb950' }}>{completedTasks}</p>
        </div>
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d' }}>
          <span style={{ fontSize: 24 }}>📈</span>
          <p style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>Success Rate</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 0' }}>{successRate}%</p>
        </div>
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d' }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <p style={{ fontSize: 12, color: '#2f81f7', marginTop: 8 }}>Active Agents</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7' }}>{activeAgents}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowNewTask(true)} style={{ padding: '14px 28px', background: '#2f81f7', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          + Create New Task
        </button>
      </div>

      {/* Recent Tasks & Agents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {/* Recent Tasks */}
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 24, border: '1px solid #21262d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Recent Tasks</h3>
            <Link href="/tasks" style={{ color: '#2f81f7', textDecoration: 'none', fontSize: 13 }}>View all →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>No tasks yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#030712', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>{task.agent_name && `${task.agent_avatar || ''} ${task.agent_name}`}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status), textTransform: 'uppercase'
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Agents */}
        <div style={{ background: '#0f1117', borderRadius: 12, padding: 24, border: '1px solid #21262d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>AI Agents</h3>
            <Link href="/agents" style={{ color: '#2f81f7', textDecoration: 'none', fontSize: 13 }}>View all →</Link>
          </div>
          {loading ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>Loading...</p>
          ) : agents.length === 0 ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 20 }}>No agents configured</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#030712', borderRadius: 8 }}>
                  <span style={{ fontSize: 24 }}>{agent.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>{agent.role}</div>
                  </div>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: agent.status === 'active' ? '#3fb950' : '#8b949e'
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
