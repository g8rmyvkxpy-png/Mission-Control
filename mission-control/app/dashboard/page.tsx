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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="page">
        <div className="page-content" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh'}}>
          <p style={{color: '#8b949e'}}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Dashboard</span>
        <button onClick={handleLogout} style={{background: 'none', border: 'none', fontSize: 18, cursor: 'pointer'}}>🚪</button>
      </div>

      {/* Main Content */}
      <div className="page-content">
        {/* Desktop Header */}
        <div className="desktop-show" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1>Dashboard 📊</h1>
            <p>Welcome back, {user?.name || 'User'}</p>
          </div>
          <div className="flex gap-16">
            <Link href="/usage" style={{color: '#8b949e', textDecoration: 'none'}}>Usage</Link>
            <Link href="/settings" style={{color: '#8b949e', textDecoration: 'none'}}>Settings</Link>
            <button onClick={handleLogout} className="btn" style={{padding: '8px 16px', fontSize: 14}}>Logout</button>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="card mb-24" style={{background: 'linear-gradient(135deg, #0f1117, rgba(47,129,247,0.15))'}}>
          <div className="flex-between">
            <div>
              <h2 style={{margin: 0}}>Welcome back, {user?.name || 'User'}! 👋</h2>
              <p style={{marginTop: 8}}>Your AI workforce is running smoothly</p>
            </div>
            <Link href="/tasks?new=true" className="btn">+ New Task</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="card text-center">
            <span style={{fontSize: 24}}>📋</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Total Tasks</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0'}}>127</p>
            <p style={{fontSize: 11, color: '#3fb950', marginTop: 4}}>+12 this week</p>
          </div>
          <div className="card text-center">
            <span style={{fontSize: 24}}>🤖</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Active Agents</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0'}}>2</p>
          </div>
          <div className="card text-center">
            <span style={{fontSize: 24}}>👥</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Leads</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0'}}>3</p>
          </div>
          <div className="card text-center">
            <span style={{fontSize: 24}}>✅</span>
            <p style={{fontSize: 12, color: '#8b949e', marginTop: 8}}>Success Rate</p>
            <p style={{fontSize: 32, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>97%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 style={{marginBottom: 16}}>Quick Actions</h2>
        <div className="quick-links-grid mb-24">
          <Link href="/tasks?new=true" className="card" style={{textAlign: 'center', textDecoration: 'none', color: '#f0f6fc', padding: 20}}>
            <span style={{fontSize: 28, display: 'block'}}>➕</span>
            <span style={{fontSize: 12, fontWeight: 500, marginTop: 8, display: 'block'}}>New Task</span>
          </Link>
          <Link href="/agents" className="card" style={{textAlign: 'center', textDecoration: 'none', color: '#f0f6fc', padding: 20}}>
            <span style={{fontSize: 28, display: 'block'}}>🤖</span>
            <span style={{fontSize: 12, fontWeight: 500, marginTop: 8, display: 'block'}}>Agents</span>
          </Link>
          <Link href="/leads" className="card" style={{textAlign: 'center', textDecoration: 'none', color: '#f0f6fc', padding: 20}}>
            <span style={{fontSize: 28, display: 'block'}}>👥</span>
            <span style={{fontSize: 12, fontWeight: 500, marginTop: 8, display: 'block'}}>Leads</span>
          </Link>
          <Link href="/analytics" className="card" style={{textAlign: 'center', textDecoration: 'none', color: '#f0f6fc', padding: 20}}>
            <span style={{fontSize: 28, display: 'block'}}>📊</span>
            <span style={{fontSize: 12, fontWeight: 500, marginTop: 8, display: 'block'}}>Analytics</span>
          </Link>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex-between mb-16">
            <h2 style={{margin: 0}}>Recent Tasks</h2>
            <Link href="/tasks" style={{color: '#2f81f7', textDecoration: 'none', fontSize: 14}}>View all →</Link>
          </div>
          <table>
            <tbody>
              {[
                { title: 'Research AI trends', agent: 'Sales Scout', status: 'completed', icon: '📋', time: '2h ago' },
                { title: 'Write blog post', agent: 'Content Writer', status: 'processing', icon: '✍️', time: '1h ago' },
                { title: 'Send outreach', agent: 'Outreach Pro', status: 'pending', icon: '📧', time: '30m ago' },
              ].map((task, i) => (
                <tr key={i}>
                  <td style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <span style={{fontSize: 20}}>{task.icon}</span>
                    <div>
                      <p style={{fontWeight: 500, margin: 0}}>{task.title}</p>
                      <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>{task.agent}</p>
                    </div>
                  </td>
                  <td style={{color: '#8b949e', fontSize: 12}}>{task.time}</td>
                  <td><span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'processing' ? 'badge-primary' : 'badge-warning'}`}>{task.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link active"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" className="nav-link"><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
