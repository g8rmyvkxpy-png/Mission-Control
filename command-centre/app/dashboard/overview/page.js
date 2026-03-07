'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActivityFeed from '@/components/ActivityFeed';

export default function OverviewPage() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({ 
    online: 0, offline: 0, tasks: 0,
    tasksToday: 0, memoriesToday: 0, docsToday: 0, projectsActive: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [agentsRes, tasksRes, memoriesRes, docsRes, projectsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/tasks'),
        fetch('/api/memories'),
        fetch('/api/docs'),
        fetch('/api/projects')
      ]);

      const agentsData = await agentsRes.json();
      const tasksData = await tasksRes.json();
      const memoriesData = await memoriesRes.json();
      const docsData = await docsRes.json();
      const projectsData = await projectsRes.json();

      const agentsList = agentsData.agents || [];
      const tasksList = tasksData.tasks || [];
      const memoriesList = memoriesData.memories || [];
      const docsList = docsData.docs || [];
      const projectsList = projectsData.projects || [];

      const today = new Date().toDateString();
      const tasksToday = tasksList.filter(t => new Date(t.created_at).toDateString() === today).length;
      const memoriesToday = memoriesList.filter(m => new Date(m.created_at).toDateString() === today).length;
      const docsToday = docsList.filter(d => new Date(d.created_at).toDateString() === today).length;
      const projectsActive = projectsList.filter(p => p.status === 'active').length;

      const online = agentsList.filter(a => a.status === 'online').length;
      const offline = agentsList.filter(a => a.status === 'offline').length;

      const agentsWithProductivity = agentsList.map(agent => {
        const agentTasks = tasksList.filter(t => t.assigned_to === agent.id);
        const completedTasks = agentTasks.filter(t => t.status === 'done');
        
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTasks = completedTasks.filter(t => new Date(t.completed_at) > dayAgo);
        
        const lastActive = agent.last_heartbeat ? (Date.now() - new Date(agent.last_heartbeat).getTime()) / 1000 / 60 : null;

        return {
          ...agent,
          productivity: {
            tasksCompleted24h: recentTasks.length,
            totalCompleted: completedTasks.length,
            lastActiveMinutes: lastActive ? Math.round(lastActive) : null
          }
        };
      });

      setAgents(agentsWithProductivity);
      setStats({ online, offline, tasks: tasksList.length, tasksToday, memoriesToday, docsToday, projectsActive });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    if (status === 'online') return '#10b981';
    if (status === 'idle') return '#f59e0b';
    return '#6b7280';
  }

  if (error) {
    return <div style={{ padding: 40, textAlign: 'center' }}><h3 style={{ color: '#ef4444', marginBottom: 16 }}>Error Loading Data</h3><p style={{ color: '#888' }}>{error}</p></div>;
  }

  return (
    <div style={{ padding: '0 24px 24px' }}>
      
      {/* 💰 Revenue Progress Tracker */}
      <div style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid #3b82f6', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Primary Mission</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>💰 $1,000,000 Revenue</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>$0</div>
            <div style={{ fontSize: 12, color: '#888' }}>Current</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, height: 24, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)', width: '0%', height: '100%', borderRadius: 8, transition: 'width 0.5s' }} />
          {/* Milestones */}
          {['$10K', '$50K', '$100K', '$250K', '$500K'].map((milestone, i) => (
            <div key={milestone} style={{ 
              position: 'absolute', 
              left: `${(i + 1) * 16.66}%`, 
              top: 0, 
              height: '100%', 
              borderLeft: '1px dashed rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              fontSize: 9,
              color: '#888',
              paddingLeft: 4
            }}>
              {milestone}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
          <div>📅 Day 1 of journey</div>
          <div>🎯 0% to goal</div>
        </div>
        
        {/* Latest CEO Report Preview */}
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>📊 Latest CEO Report</span>
            <button 
              onClick={() => router.push('/dashboard/docs?category=report')}
              style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 11 }}
            >
              Read Full Report →
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>
            Neo's daily report appears here at 7PM
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase' }}>📊 Today's Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{stats.tasksToday}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Tasks</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>{stats.memoriesToday}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Memories</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{stats.docsToday}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Docs</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{stats.projectsActive}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Projects</div>
          </div>
        </div>
      </div>

      {/* Today's Enhancements - Autonomous Agent Improvements */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase' }}>🚀 Today's Enhancements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Command Centre Changes */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🎛️</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Command Centre</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>Auto</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔄</div>
              <div>Scanning at 8AM daily</div>
              <div style={{ fontSize: 11, color: '#666' }}>Atlas audits UI/UX</div>
            </div>
          </div>
          
          {/* Website Changes */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🌐</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>ppventures.tech</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>Auto</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔄</div>
              <div>Scanning at 8AM daily</div>
              <div style={{ fontSize: 11, color: '#666' }}>Atlas audits content/SEO</div>
            </div>
          </div>
        </div>
        
        {/* Schedule Info */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, fontSize: 11, color: '#666' }}>
          <div><span style={{ color: '#10b981' }}>●</span> 8AM — Atlas Scan</div>
          <div><span style={{ color: '#8b5cf6' }}>●</span> 9AM — Neo Tasks</div>
          <div><span style={{ color: '#f59e0b' }}>●</span> 6PM — Orbit Report</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.online}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Online</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6b7280' }}>{stats.offline}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Offline</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{stats.tasks}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Total Tasks</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>🤖 Agents</h2>
          <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>↻</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>
        ) : agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <p style={{ color: '#888' }}>No agents configured</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {agents.map(agent => (
              <div 
                key={agent.id} 
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer' }}
                onClick={() => router.push(`/dashboard/agent/${agent.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: agent.avatar_color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    {agent.name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{agent.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(agent.status) }} />
                      <span style={{ fontSize: 12, color: '#888' }}>{agent.status}</span>
                    </div>
                  </div>
                </div>

                {/* Catchphrase */}
                {agent.catchphrase && (
                  <div style={{ fontSize: 12, fontStyle: 'italic', color: '#888', marginBottom: 8 }}>
                    "{agent.catchphrase}"
                  </div>
                )}

                {/* Specialisation Tags */}
                {agent.specialisation && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {agent.specialisation.split(',').slice(0, 3).map((spec, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        {spec.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{agent.productivity?.tasksCompleted24h || 0}</div>
                    <div style={{ fontSize: 10, color: '#666' }}>Tasks 24h</div>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{agent.productivity?.lastActiveMinutes ? (agent.productivity.lastActiveMinutes < 60 ? `${agent.productivity.lastActiveMinutes}m` : `${Math.round(agent.productivity.lastActiveMinutes/60)}h`) : '—'}</div>
                    <div style={{ fontSize: 10, color: '#666' }}>Last Active</div>
                  </div>
                </div>

                {agent.current_task && agent.current_task !== 'idle' && (
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 12, padding: 8, background: 'var(--bg)', borderRadius: 6 }}>📝 {agent.current_task.substring(0, 40)}...</div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => router.push(`/dashboard/board?agent=${agent.id}`)} style={{ flex: 1, padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>📋 Tasks</button>
                  <button onClick={() => router.push(`/dashboard/memory?agent=${agent.id}`)} style={{ flex: 1, padding: '8px 12px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>💾 Memory</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📡 Live Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
