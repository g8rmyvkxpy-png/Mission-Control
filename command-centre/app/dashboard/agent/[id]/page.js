'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AgentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  async function fetchData() {
    try {
      const [agentRes, tasksRes, logsRes] = await Promise.all([
        fetch(`/api/agents/${params.id}`),
        fetch(`/api/tasks?agent_id=${params.id}`),
        fetch(`/api/logs?agent_id=${params.id}&limit=10`)
      ]);

      const agentData = await agentRes.json();
      const tasksData = await tasksRes.json();
      const logsData = await logsRes.json();

      setAgent(agentData.agent || agentData.agents?.[0]);
      setTasks(tasksData.tasks || []);
      setLogs(logsData.logs || []);
      
      if (agentData.agent || agentData.agents?.[0]) {
        const a = agentData.agent || agentData.agents?.[0];
        setFormData({
          personality: a.personality || '',
          tone: a.tone || '',
          specialisation: a.specialisation || '',
          backstory: a.backstory || '',
          catchphrase: a.catchphrase || '',
          working_style: a.working_style || ''
        });
      }
    } catch (e) {
      console.error('Error fetching agent:', e);
    } finally {
      setLoading(false);
    }
  }

  async function savePersonality() {
    try {
      const res = await fetch(`/api/agents/${params.id}/personality`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setEditing(false);
        fetchData();
      }
    } catch (e) {
      console.error('Error saving personality:', e);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'online': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#888';
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#888' }}>Loading agent profile...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: 16 }}>Agent not found</h2>
        <button className="btn btn-primary" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done');
  const recentTasks = completedTasks.slice(0, 5);

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ← Back
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: agent.avatar_color || '#3b82f6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff'
          }}>
            {agent.name?.[0]}
          </div>
          
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{agent.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ 
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: getStatusColor(agent.status) + '20', 
                color: getStatusColor(agent.status),
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(agent.status) }} />
                {agent.status}
              </span>
              {agent.catchphrase && (
                <span style={{ fontStyle: 'italic', color: '#888' }}>"{agent.catchphrase}"</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{completedTasks.length}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Tasks Completed</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{tasks.filter(t => t.status === 'in-progress').length}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>In Progress</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>{logs.length}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Activity Logs</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
            {agent.last_heartbeat ? Math.round((Date.now() - new Date(agent.last_heartbeat).getTime()) / 1000 / 60) : '—'}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Minutes Ago</div>
        </div>
      </div>

      {/* Personality Section */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>🎭 Personality Profile</h2>
          <button 
            className="btn btn-sm" 
            onClick={() => editing ? savePersonality() : setEditing(true)}
          >
            {editing ? '💾 Save' : '✏️ Edit'}
          </button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Personality</label>
              <textarea
                className="form-textarea"
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                rows={2}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Tone</label>
              <input
                type="text"
                className="form-input"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Specialisation</label>
              <input
                type="text"
                className="form-input"
                value={formData.specialisation}
                onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Backstory</label>
              <textarea
                className="form-textarea"
                value={formData.backstory}
                onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                rows={3}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Catchphrase</label>
              <input
                type="text"
                className="form-input"
                value={formData.catchphrase}
                onChange={(e) => setFormData({ ...formData, catchphrase: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Working Style</label>
              <textarea
                className="form-textarea"
                value={formData.working_style}
                onChange={(e) => setFormData({ ...formData, working_style: e.target.value })}
                rows={2}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Personality</div>
              <p style={{ margin: 0 }}>{agent.personality || 'Not set'}</p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Tone</div>
              <p style={{ margin: 0 }}>{agent.tone || 'Not set'}</p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Specialisation</div>
              <p style={{ margin: 0 }}>{agent.specialisation || 'Not set'}</p>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Catchphrase</div>
              <p style={{ margin: 0, fontStyle: 'italic' }}>"{agent.catchphrase || 'Not set'}"</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Backstory</div>
              <p style={{ margin: 0 }}>{agent.backstory || 'Not set'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Working Style</div>
              <p style={{ margin: 0 }}>{agent.working_style || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Specialisation Tags */}
      {agent.specialisation && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Specialisations</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {agent.specialisation.split(',').map((spec, i) => (
              <span key={i} style={{ 
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6'
              }}>
                {spec.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
        {logs.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 20 }}>No recent activity</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.map((log) => (
              <div key={log.id} style={{ 
                background: 'var(--bg-card)', border: '1px solid var(--border)', 
                borderRadius: 8, padding: 12, fontSize: 13 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ 
                    fontSize: 10, padding: '2px 8px', borderRadius: 4,
                    background: log.log_type === 'error' ? '#ef444420' : log.log_type === 'task' ? '#10b98120' : '#88820',
                    color: log.log_type === 'error' ? '#ef4444' : log.log_type === 'task' ? '#10b981' : '#888'
                  }}>
                    {log.log_type}
                  </span>
                  <span style={{ color: '#888', fontSize: 11 }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0 }}>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
