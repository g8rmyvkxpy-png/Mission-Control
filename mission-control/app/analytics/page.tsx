'use client';

import { useState, useEffect } from 'react';

interface Analytics {
  overview: {
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
    workflowsRun: number;
  };
  taskMetrics: {
    completionRate: number;
    avgCompletionTime: number;
    tasksByDay: { date: string; count: number }[];
  };
  agentMetrics: {
    agentId: string;
    agentName: string;
    tasksCompleted: number;
    avgDuration: number;
  }[];
}

export default function AnalyticsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org_id') || localStorage.getItem('mc_org_id');
    if (org) {
      setOrgId(org);
      fetchAnalytics(org);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = async (orgId: string) => {
    try {
      const res = await fetch(`/api/analytics?org_id=${orgId}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!orgId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Organization Selected</h2>
        <p style={{ color: '#a1a1aa', marginTop: '12px' }}>
          Add ?org_id=YOUR_ORG_ID to the URL
        </p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No data available</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>📊 Analytics</h1>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316' }}>{analytics.overview.totalAgents}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Agents</div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>{analytics.overview.activeAgents}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active</div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>{analytics.overview.totalTasks}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Tasks</div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#14b8a6' }}>{analytics.overview.completedTasks}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Completed</div>
        </div>
      </div>

      {/* Task Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Completion Rate</h3>
          <div style={{ fontSize: '48px', fontWeight: '700', color: '#22c55e' }}>
            {analytics.taskMetrics.completionRate.toFixed(1)}%
          </div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Avg. Task Duration</h3>
          <div style={{ fontSize: '48px', fontWeight: '700', color: '#8b5cf6' }}>
            {analytics.taskMetrics.avgCompletionTime.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Agent Performance</h3>
        {analytics.agentMetrics.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No agent data yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280' }}>Agent</th>
                <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280' }}>Tasks Completed</th>
                <th style={{ textAlign: 'right', padding: '12px', color: '#6b7280' }}>Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {analytics.agentMetrics.map(agent => (
                <tr key={agent.agentId} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '12px' }}>{agent.agentName}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{agent.tasksCompleted}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{agent.avgDuration.toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
