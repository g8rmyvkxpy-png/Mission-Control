'use client';

import { useState, useEffect } from 'react';

export default function ActivityFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Poll for updates
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch('/api/logs?limit=20');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
    setLoading(false);
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  function getTypeColor(type) {
    switch (type) {
      case 'heartbeat': return 'var(--accent-cyan)';
      case 'task': return 'var(--accent-blue)';
      case 'error': return 'var(--accent-red)';
      default: return 'var(--accent-green)';
    }
  }

  if (loading) {
    return <div className="card loading">Loading...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="card" style={{ maxHeight: 400, overflow: 'auto' }}>
        <div className="empty" style={{ padding: 20 }}>
          <p>No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxHeight: 500, overflow: 'auto' }}>
      {logs.map((log) => (
        <div key={log.id} className="activity-item">
          <div
            className="activity-dot"
            style={{ background: getTypeColor(log.log_type) }}
          />
          <div className="activity-content">
            <div className="activity-message">
              {log.agent && (
                <span style={{ color: log.agent.avatar_color || 'var(--accent-green)', fontWeight: 600 }}>
                  {log.agent.name}
                </span>
              )}
              {' '}{log.message}
            </div>
            <div className="activity-time">
              {formatTime(log.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
