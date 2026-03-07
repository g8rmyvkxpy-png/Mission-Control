'use client';

import { useState, useEffect } from 'react';

export default function AgentCard({ agent, onTrigger }) {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [agent.last_heartbeat]);

  function updateTime() {
    if (!agent.last_heartbeat) {
      setTimeSince('Never');
      return;
    }
    
    const last = new Date(agent.last_heartbeat);
    const now = new Date();
    const diff = Math.floor((now - last) / 1000);

    if (diff < 60) setTimeSince('Just now');
    else if (diff < 3600) setTimeSince(`${Math.floor(diff / 60)}m ago`);
    else if (diff < 86400) setTimeSince(`${Math.floor(diff / 3600)}h ago`);
    else setTimeSince(`${Math.floor(diff / 86400)}d ago`);
  }

  const isOffline = agent.status === 'offline';
  const isStale = timeSince.includes('m') && parseInt(timeSince) > 10 && agent.status === 'online';

  return (
    <div
      className="card"
      style={{
        borderColor: isOffline ? 'var(--accent-red)' : isStale ? 'var(--accent-yellow)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div
          className="avatar"
          style={{ background: agent.avatar_color || '#10b981' }}
        >
          {agent.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{agent.name}</div>
          <span className={`status ${agent.status}`}>
            <span className="status-dot" />
            {agent.status}
          </span>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>Current Task:</strong> {agent.current_task || 'Idle'}
        </div>
        <div>
          <strong>Last Heartbeat:</strong> {timeSince}
        </div>
      </div>

      {isOffline && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
            color: 'var(--accent-red)',
            marginBottom: 12,
          }}
        >
          ⚠️ Agent offline - check connection
        </div>
      )}

      <button className="btn btn-sm" onClick={onTrigger}>
        ⚡ Trigger Task
      </button>
    </div>
  );
}
