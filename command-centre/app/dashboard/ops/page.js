'use client';

import { useState, useEffect } from 'react';

export default function OpsPage() {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cronJobs, setCronJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const [agentsRes, logsRes, cronsRes] = await Promise.all([
      fetch('/api/agents'),
      fetch('/api/logs?limit=20'),
      fetch('/api/crons')
    ]);

    const agentsData = await agentsRes.json();
    const logsData = await logsRes.json();
    const cronsData = await cronsRes.json();

    setAgents(agentsData.agents || []);
    setLogs(logsData.logs || []);
    setCronJobs(cronsData.cron_jobs || []);
    setLoading(false);
  }

  const desks = [
    { name: 'Neo', color: '#10b981' },
    { name: 'Atlas', color: '#3b82f6' },
    { name: 'Orbit', color: '#f59e0b' }
  ];

  function getAgentStatus(agentName) {
    const agent = agents.find(a => a.name === agentName);
    if (!agent) return { status: 'offline', task: 'Unknown' };
    return {
      status: agent.status,
      task: agent.current_task || 'Idle',
      lastHeartbeat: agent.last_heartbeat
    };
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatLogTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return <div className="loading">Loading operations...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>⚙️ Operations</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Team status, crons, and system activity
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        {[
          { id: 'overview', label: '👥 Team' },
          { id: 'crons', label: '⏰ Crons' },
          { id: 'logs', label: '📋 Activity' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab - Team Status */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {desks.map(desk => {
              const agentStatus = getAgentStatus(desk.name);
              const agent = agents.find(a => a.name === desk.name);
              
              return (
                <div 
                  key={desk.name}
                  className="card"
                  style={{ 
                    padding: 20,
                    borderTop: `3px solid ${desk.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: desk.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#000'
                    }}>
                      {desk.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{desk.name}</div>
                      <div style={{ 
                        fontSize: 12, 
                        color: agentStatus.status === 'online' ? '#10b981' : '#888'
                      }}>
                        ● {agentStatus.status}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>CURRENT TASK</div>
                    <div style={{ fontSize: 13 }}>{agentStatus.task}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>LAST HEARTBEAT</div>
                    <div style={{ fontSize: 13 }}>{formatTime(agentStatus.lastHeartbeat)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                {agents.filter(a => a.status === 'online').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Online</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                {agents.filter(a => a.status === 'idle').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Idle</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>
                {cronJobs.filter(c => c.status === 'active').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Crons</div>
            </div>
          </div>
        </div>
      )}

      {/* Crons Tab */}
      {activeTab === 'crons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Scheduled Cron Jobs</h2>
          </div>

          {cronJobs.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏰</div>
              <div>No cron jobs configured</div>
            </div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Job</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Agent</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Schedule</th>
                    <th style={{ textAlign: 'center', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Last Run</th>
                  </tr>
                </thead>
                <tbody>
                  {cronJobs.map(cron => (
                    <tr key={cron.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 12, fontWeight: 500 }}>{cron.title}</td>
                      <td style={{ padding: 12 }}>{cron.agent_id ? 'Agent' : 'System'}</td>
                      <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 12 }}>{cron.cron_expression}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <span style={{
                          background: cron.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                          color: cron.status === 'active' ? '#10b981' : '#888',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11
                        }}>
                          {cron.status}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                        {cron.last_run ? formatLogTime(cron.last_run) : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h2>
          
          {logs.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <div>No activity yet</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              {logs.map((log, idx) => (
                <div 
                  key={log.id || idx}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: idx < logs.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    marginTop: 6,
                    background: log.log_type === 'error' ? '#ef4444' : 
                               log.log_type === 'heartbeat' ? '#3b82f6' : '#10b981'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{log.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {log.timestamp ? formatLogTime(log.timestamp) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
