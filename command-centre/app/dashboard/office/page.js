'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://iglfjgsqqknionzmmprj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjI1NjIsImV4cCI6MjA4ODE5ODU2Mn0.y6rfeWhG-ExBCiQarPXgvLqaDv6NBaA4MB9FbSbB_3w';

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

export default function OfficePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hq');
  const [data, setData] = useState({ tasks: [], goals: [], agents: [], revenue: [], projects: [] });

  useEffect(() => {
    async function loadData() {
      const [tasks, goals, agents, revenue, projects] = await Promise.all([
        fetchAPI('tasks?select=*&order=created_at.desc&limit=50'),
        fetchAPI('goals?select=*&order=created_at.desc&limit=20'),
        fetchAPI('agents?select=*&order=created_at.desc&limit=20'),
        fetchAPI('revenue_entries?select=*&order=created_at.desc&limit=20'),
        fetchAPI('projects?select=*&order=created_at.desc&limit=20'),
      ]);
      setData({ tasks, goals, agents, revenue, projects });
      setLoading(false);
    }
    loadData();
  }, []);

  const totalRevenue = data.revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const completedTasks = data.tasks.filter(t => t.status === 'done').length;
  const activeTasks = data.tasks.filter(t => t.status !== 'done').length;
  const activeGoals = data.goals.filter(g => g.status !== 'completed').length;

  if (loading) return <div style={{width:'100%',height:'calc(100vh - 120px)',background:'#0a0a15',display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}>Loading Command Centre...</div>;

  const hasData = data.tasks.length > 0 || data.goals.length > 0 || data.revenue.length > 0;

  const CS = { background: 'rgba(10,10,21,0.95)', border: '1px solid #333', borderRadius: '12px', padding: '16px' };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', background: '#0a0a15', overflow: 'auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>🏢 AI CorpOS</h1>
        <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0' }}>Real-time company overview</p>
      </div>

      {!hasData && (
        <div style={{ ...CS, borderColor: '#f59e0b', textAlign: 'center', padding: '40px', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ color: '#fff', margin: '0 0 8px' }}>No Data Yet</h2>
          <p style={{ color: '#888', margin: '0 0 16px' }}>Start by creating tasks, goals, or adding revenue entries in the Command Centre</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/dashboard/board" style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px' }}>Go to Tasks</a>
            <a href="/dashboard/goals" style={{ background: '#10b981', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px' }}>Go to Goals</a>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ ...CS, borderColor: '#10b981' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>💰 TOTAL REVENUE</div>
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>${totalRevenue.toLocaleString()}</div>
          <div style={{ color: '#666', fontSize: '10px' }}>{data.revenue.length} entries</div>
        </div>
        <div style={{ ...CS, borderColor: '#3b82f6' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>📋 ACTIVE TASKS</div>
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>{activeTasks}</div>
          <div style={{ color: '#666', fontSize: '10px' }}>{completedTasks} completed</div>
        </div>
        <div style={{ ...CS, borderColor: '#8b5cf6' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>🎯 ACTIVE GOALS</div>
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>{activeGoals}</div>
          <div style={{ color: '#666', fontSize: '10px' }}>{data.goals.length} total</div>
        </div>
        <div style={{ ...CS, borderColor: '#f59e0b' }}>
          <div style={{ color: '#888', fontSize: '10px' }}>🤖 AGENTS</div>
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>{data.agents.length}</div>
          <div style={{ color: '#666', fontSize: '10px' }}>AI team members</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {[['hq', '📊 Overview'], ['tasks', '📋 Tasks'], ['goals', '🎯 Goals'], ['revenue', '💰 Revenue'], ['agents', '🤖 Agents']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: activeTab === tab ? 'rgba(59,130,246,0.3)' : 'transparent',
            border: 'none', borderRadius: '4px', padding: '8px 16px', color: activeTab === tab ? '#60a5fa' : '#666',
            fontSize: '11px', cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'hq' && hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ ...CS }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>📋 RECENT TASKS</div>
            {data.tasks.slice(0, 5).map(t => (
              <div key={t.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '10px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontSize: '11px' }}>{t.title || 'Untitled'}</span>
                <span style={{ background: t.status === 'done' ? '#10b981' : '#3b82f6', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>{t.status || 'pending'}</span>
              </div>
            ))}
          </div>
          <div style={{ ...CS }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>🎯 RECENT GOALS</div>
            {data.goals.slice(0, 5).map(g => (
              <div key={g.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '10px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontSize: '11px' }}>{g.title || 'Untitled'}</span>
                <span style={{ background: g.status === 'completed' ? '#10b981' : '#f59e0b', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>{g.status || 'in_progress'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div style={{ ...CS }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>📋 ALL TASKS ({data.tasks.length})</div>
          {data.tasks.length === 0 ? <p style={{ color: '#666', fontSize: '12px' }}>No tasks yet</p> : data.tasks.map(t => (
            <div key={t.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>{t.title || 'Untitled'}</span>
              <span style={{ background: t.status === 'done' ? '#10b981' : t.status === 'in_progress' ? '#3b82f6' : '#6b7280', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '10px' }}>{t.status || 'pending'}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'goals' && (
        <div style={{ ...CS }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>🎯 ALL GOALS ({data.goals.length})</div>
          {data.goals.length === 0 ? <p style={{ color: '#666', fontSize: '12px' }}>No goals yet</p> : data.goals.map(g => (
            <div key={g.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>{g.title || 'Untitled'}</span>
              <span style={{ background: g.status === 'completed' ? '#10b981' : '#f59e0b', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '10px' }}>{g.status || 'in_progress'}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'revenue' && (
        <div style={{ ...CS }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>💰 REVENUE ENTRIES ({data.revenue.length})</div>
          {data.revenue.length === 0 ? <p style={{ color: '#666', fontSize: '12px' }}>No revenue entries yet</p> : data.revenue.map(r => (
            <div key={r.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>{r.source || 'Revenue'} - {r.description || ''}</span>
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>+${r.amount || 0}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'agents' && (
        <div style={{ ...CS }}>
          <div style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>🤖 AGENTS ({data.agents.length})</div>
          {data.agents.length === 0 ? <p style={{ color: '#666', fontSize: '12px' }}>No agents yet</p> : data.agents.map(a => (
            <div key={a.id} style={{ background: '#1a1a2e', borderRadius: '6px', padding: '12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{a.name}</span><span style={{ color: '#666', fontSize: '11px', marginLeft: '8px' }}>{a.role}</span></div>
              <span style={{ background: a.status === 'active' ? '#10b981' : '#6b7280', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '10px' }}>{a.status || 'inactive'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
