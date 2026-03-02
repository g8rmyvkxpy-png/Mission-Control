'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  plan: string;
}

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

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
    
    if (!loading) {
      fetchData();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="page">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#8b949e'}}>
          Loading...
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'online').length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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

  const formatTime = (timestamp?: number) => {
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
        <span style={{fontWeight: 700, fontSize: 18}}>Dashboard</span>
        <button onClick={handleLogout} style={{background: 'none', border: 'none', fontSize: 18, cursor: 'pointer'}}>🚪</button>
      </div>

      {/* Main Content */}
      <div style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, marginBottom: 8}}>Dashboard 📊</h1>
            <p style={{color: '#8b949e', margin: 0}}>Welcome back, {user?.name || 'User'}!</p>
          </div>
          <div style={{display: 'flex', gap: 24}}>
            <Link href="/usage" style={{color: '#8b949e', textDecoration: 'none'}}>Usage</Link>
            <Link href="/settings" style={{color: '#8b949e', textDecoration: 'none'}}>Settings</Link>
            <button onClick={handleLogout} style={{padding: '8px 16px', background: '#21262d', color: '#f0f6fc', border: 'none', borderRadius: 8, cursor: 'pointer'}}>Logout</button>
          </div>
        </div>

        {/* Welcome Card */}
        <div style={{background: 'linear-gradient(135deg, #0f1117, rgba(47,129,247,0.15))', borderRadius: 16, padding: 24, marginBottom: 32, border: '1px solid #21262d'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16}}>
            <div>
              <h2 style={{margin: 0, fontSize: 24}}>Welcome back, {user?.name || 'User'}! 👋</h2>
              <p style={{marginTop: 8, color: '#8b949e'}}>Your AI workforce is running smoothly</p>
            </div>
            <Link href="/tasks" style={{padding: '12px 24px', background: '#2f81f7', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600}}>+ New Task</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32}}>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d'}}>
            <span style={{fontSize: 24}}>📋</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Total Tasks</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0'}}>{totalTasks}</p>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d'}}>
            <span style={{fontSize: 24}}>✅</span>
            <p style={{fontSize: 12, color: '#3fb950', marginTop: 8}}>Completed</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{completedTasks}</p>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d'}}>
            <span style={{fontSize: 24}}>📈</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Success Rate</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0'}}>{successRate}%</p>
          </div>
          <div style={{background: '#0f1117', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #21262d'}}>
            <span style={{fontSize: 24}}>🤖</span>
            <p style={{fontSize: 12, color: '#2f81f7', marginTop: 8}}>Active Agents</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7'}}>{activeAgents}</p>
          </div>
        </div>

        {/* Recent Tasks & Agents */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24}}>
          {/* Recent Tasks */}
          <div style={{background: '#0f1117', borderRadius: 12, padding: 24, border: '1px solid #21262d'}}>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>Recent Tasks</h3>
            {tasks.length === 0 ? (
              <p style={{color: '#8b949e', textAlign: 'center', padding: 20}}>No tasks yet</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#030712', borderRadius: 8}}>
                    <div>
                      <div style={{fontWeight: 500, fontSize: 14}}>{task.title}</div>
                      <div style={{fontSize: 12, color: '#8b949e'}}>{task.agent_name && `${task.agent_avatar || ''} ${task.agent_name}`}</div>
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
            <Link href="/tasks" style={{display: 'block', marginTop: 16, color: '#2f81f7', textDecoration: 'none', fontSize: 14}}>View all tasks →</Link>
          </div>

          {/* Active Agents */}
          <div style={{background: '#0f1117', borderRadius: 12, padding: 24, border: '1px solid #21262d'}}>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>AI Agents</h3>
            {agents.length === 0 ? (
              <p style={{color: '#8b949e', textAlign: 'center', padding: 20}}>No agents configured</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {agents.slice(0, 5).map((agent) => (
                  <div key={agent.id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#030712', borderRadius: 8}}>
                    <span style={{fontSize: 24}}>{agent.avatar}</span>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 500, fontSize: 14}}>{agent.name}</div>
                      <div style={{fontSize: 12, color: '#8b949e'}}>{agent.role}</div>
                    </div>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: agent.status === 'active' || agent.status === 'online' ? '#3fb950' : '#8b949e'
                    }} />
                  </div>
                ))}
              </div>
            )}
            <Link href="/agents" style={{display: 'block', marginTop: 16, color: '#2f81f7', textDecoration: 'none', fontSize: 14}}>View all agents →</Link>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#2f81f7', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
