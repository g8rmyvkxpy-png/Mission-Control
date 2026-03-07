'use client';

import { useState, useEffect } from 'react';
import CronCalendar from '@/components/CronCalendar';
import NewCronModal from '@/components/NewCronModal';
import AgentScheduler from '@/components/AgentScheduler';

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('cron'); // 'cron' or 'scheduler'
  const [cronJobs, setCronJobs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCron, setShowNewCron] = useState(false);

  useEffect(() => {
    fetchCronJobs();
    fetchAgents();
    
    const interval = setInterval(fetchCronJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCronJobs() {
    const res = await fetch('/api/crons');
    const data = await res.json();
    setCronJobs(data.cron_jobs || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function toggleCron(cronId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    const res = await fetch(`/api/crons?id=${cronId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      fetchCronJobs();
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        gap: 4, 
        background: 'var(--bg-tertiary)', 
        padding: 4, 
        borderRadius: 8,
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('cron')}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: activeTab === 'cron' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'cron' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 14,
            transition: 'all 0.2s'
          }}
        >
          ⏰ Cron Jobs
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          style={{
            padding: '8px 20px',
            borderRadius: 6,
            border: 'none',
            background: activeTab === 'scheduler' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'scheduler' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 14,
            transition: 'all 0.2s'
          }}
        >
          📅 Agent Scheduler
        </button>
      </div>

      {activeTab === 'cron' ? (
        /* Cron Jobs Tab - Original Content */
        <div>
          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Cron Jobs</h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Scheduled tasks for your agents
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setShowNewCron(true)}>
              + Add Cron Job
            </button>
          </div>

          {/* Calendar View */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Schedule</h2>
            <CronCalendar cronJobs={cronJobs} />
          </div>

          {/* Cron Jobs List */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>All Cron Jobs</h2>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : cronJobs.length === 0 ? (
              <div className="card empty">
                <p>No cron jobs scheduled</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => setShowNewCron(true)}
                >
                  Create First Cron Job
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Agent</th>
                      <th>Schedule</th>
                      <th>Status</th>
                      <th>Last Run</th>
                      <th>Next Run</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronJobs.map((cron) => (
                      <tr key={cron.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{cron.title}</div>
                          {cron.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {cron.description}
                            </div>
                          )}
                        </td>
                        <td>
                          {cron.agent && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div
                                className="avatar"
                                style={{
                                  width: 24,
                                  height: 24,
                                  fontSize: 10,
                                  background: cron.agent.avatar_color || '#10b981',
                                }}
                              >
                                {cron.agent.name?.[0]}
                              </div>
                              {cron.agent.name}
                            </div>
                          )}
                        </td>
                        <td>
                          <code style={{ fontSize: 12, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>
                            {cron.cron_expression}
                          </code>
                        </td>
                        <td>
                          <span className={`status ${cron.status}`}>
                            <span className="status-dot" />
                            {cron.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {formatDate(cron.last_run)}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {formatDate(cron.next_run)}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() => toggleCron(cron.id, cron.status)}
                          >
                            {cron.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* New Cron Modal */}
          {showNewCron && (
            <NewCronModal
              agents={agents}
              onClose={() => setShowNewCron(false)}
              onCreated={() => {
                setShowNewCron(false);
                fetchCronJobs();
              }}
            />
          )}
        </div>
      ) : (
        /* Agent Scheduler Tab */
        <AgentScheduler agents={agents} />
      )}
    </div>
  );
}
