'use client';

import { useState, useEffect } from 'react';

export default function OfficePage() {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lastActivity, setLastActivity] = useState({});
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [taskCounts, setTaskCounts] = useState({});
  
  const desks = [
    { name: 'Neo', color: '#10b981' },
    { name: 'Atlas', color: '#58a6ff' },
    { name: 'Orbit', color: '#f0883e' }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) setTimeOfDay('day');
    else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    await Promise.all([fetchAgents(), fetchLogs()]);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
    
    // Get task counts for each agent
    const counts = {};
    for (const agent of data.agents || []) {
      try {
        const tasksRes = await fetch(`/api/agents/${agent.id}/tasks`);
        const tasksData = await tasksRes.json();
        const today = new Date().toDateString();
        const todayTasks = (tasksData.tasks || []).filter(t => 
          new Date(t.updated_at).toDateString() === today && t.status === 'done'
        );
        counts[agent.name] = todayTasks.length;
      } catch {
        counts[agent.name] = 0;
      }
    }
    setTaskCounts(counts);
  }

  async function fetchLogs() {
    const res = await fetch('/api/logs?limit=30');
    const data = await res.json();
    const allLogs = data.logs || [];
    
    // Filter meaningful activities
    const meaningfulLogs = allLogs.filter(log => {
      const msg = log.message?.toLowerCase() || '';
      return !msg.includes('heartbeat') && 
             !msg.includes('standing by') && 
             !msg.includes('polling') &&
             !msg.includes('checking') &&
             msg.length > 15;
    }).slice(0, 5);
    
    setLogs(meaningfulLogs);
    
    // Get last activity per agent
    const last = {};
    for (const log of meaningfulLogs) {
      const name = log.agent?.name || 'System';
      if (!last[name]) {
        last[name] = log.message;
      }
    }
    setLastActivity(last);
  }

  function getAgentStatus(agentName) {
    const agent = agents.find(a => a.name?.toLowerCase() === agentName.toLowerCase());
    return agent?.status || 'offline';
  }

  function getAgentTask(agentName) {
    const agent = agents.find(a => a.name?.toLowerCase() === agentName.toLowerCase());
    return agent?.current_task || '';
  }

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '0 24px 24px' }}>
      
      {/* Full office space */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        borderRadius: 12, 
        overflow: 'hidden', 
        border: '1px solid #333', 
        background: '#111827',
        backgroundImage: 'linear-gradient(#1e2a3a 1px, transparent 1px), linear-gradient(90deg, #1e2a3a 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }}>
        
        {/* Server Room */}
        <div style={{ position: 'absolute', right: 20, top: 20, width: 180, height: 160, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>🖥️ Server Room</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 24, background: Math.sin(Date.now()/500 + i) > 0 ? '#10b981' : '#064e3b', borderRadius: 3 }} />
            ))}
          </div>
        </div>
        
        {/* Water Cooler - improved */}
        <div style={{ position: 'absolute', left: 20, bottom: 20, width: 150, height: 160, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>💧 Water Cooler</div>
          {/* Water tank */}
          <div style={{ width: 50, height: 50, background: '#3b82f6', margin: '0 auto 4px', borderRadius: '6px 6px 0 0' }}>
            <div style={{ width: '80%', height: '60%', background: '#60a5fa', margin: 'auto', borderRadius: '4px', marginTop: 4 }} />
          </div>
          {/* Dispenser */}
          <div style={{ width: 50, height: 30, background: '#9ca3af', margin: '0 auto', borderRadius: '0 0 4px 4px' }}>
            <div style={{ width: 20, height: 8, background: '#6b7280', margin: 'auto', marginTop: 8, borderRadius: 2 }} />
          </div>
        </div>
        
        {/* Break Room - improved with sofa */}
        <div style={{ position: 'absolute', right: 20, bottom: 20, width: 180, height: 160, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>☕ Break Room</div>
          {/* Sofa back */}
          <div style={{ height: 25, background: '#b45309', borderRadius: '8px 8px 0 0', marginTop: 16 }} />
          {/* Seat cushions */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, height: 25, background: '#d97706', borderRadius: '4px' }} />
            <div style={{ flex: 1, height: 25, background: '#d97706', borderRadius: '4px' }} />
          </div>
          {/* Armrests */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -8 }}>
            <div style={{ width: 12, height: 20, background: '#92400e', borderRadius: '0 0 4px 4px' }} />
            <div style={{ width: 12, height: 20, background: '#92400e', borderRadius: '0 0 4px 4px' }} />
          </div>
        </div>
        
        {/* Three desks */}
        <div style={{ 
          position: 'absolute', 
          left: '15%', 
          top: '20%', 
          width: '70%', 
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          {desks.map((desk) => {
            const status = getAgentStatus(desk.name);
            const task = getAgentTask(desk.name);
            const isWorking = status === 'working' || (task && task !== 'idle' && task !== 'standby');
            const isOnline = status === 'online' || status === 'working';
            const isOffline = status === 'offline';
            const isIdle = status === 'idle' || status === 'standby';
            
            return (
              <div key={desk.name} style={{ width: 160, position: 'relative' }}>
                
                {/* Speech bubble for last activity */}
                {lastActivity[desk.name] && !isOffline && (
                  <div style={{
                    position: 'absolute',
                    top: -70,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#161b22',
                    border: `1px solid ${desk.color}`,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: '#e6edf3',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    zIndex: 10,
                  }}>
                    {lastActivity[desk.name].slice(0, 40)}
                    <div style={{
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `6px solid ${desk.color}`
                    }} />
                  </div>
                )}
                
                {/* Avatar */}
                <div style={{ position: 'absolute', left: 54, top: 0, width: 52, height: 72, zIndex: 10 }}>
                  {desk.name === 'Neo' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 6, width: 40, height: 10, background: isOffline ? '#4b5563' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 8, left: 10, width: 32, height: 28, background: isOffline ? '#6b7280' : '#fcd9b6' }} />
                      <div style={{ position: 'absolute', top: 16, left: 14, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 16, left: 26, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 34, left: 20, width: 12, height: 8, background: isOffline ? '#6b7280' : '#e8b89d' }} />
                      <div style={{ position: 'absolute', top: 40, left: 4, width: 44, height: 32, background: isOffline ? '#374151' : '#2d2d2d' }} />
                      {!isOffline && <div style={{ position: 'absolute', top: 42, left: 22, width: 8, height: 20, background: desk.color }} />}
                      {/* Status dot with pulse animation */}
                      <div style={{ 
                        position: 'absolute', top: -8, right: -8, width: 14, height: 14, borderRadius: '50%', 
                        background: isWorking ? '#10b981' : isIdle ? '#8b949e' : '#f85149', 
                        border: '2px solid #111827',
                        boxShadow: isWorking ? '0 0 8px #10b981' : 'none',
                        animation: isWorking ? 'pulse 2s infinite' : 'none'
                      }} />
                    </div>
                  )}
                  {desk.name === 'Atlas' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: -2, left: 6, width: 40, height: 14, background: isOffline ? '#4b5563' : '#4a3728' }} />
                      <div style={{ position: 'absolute', top: 8, left: 10, width: 32, height: 28, background: isOffline ? '#6b7280' : '#fcd9b6' }} />
                      <div style={{ position: 'absolute', top: 16, left: 14, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 16, left: 26, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      {!isOffline && (
                        <>
                          <div style={{ position: 'absolute', top: 15, left: 13, width: 8, height: 4, background: '#fff' }} />
                          <div style={{ position: 'absolute', top: 15, left: 25, width: 8, height: 4, background: '#fff' }} />
                        </>
                      )}
                      <div style={{ position: 'absolute', top: 34, left: 20, width: 12, height: 8, background: isOffline ? '#6b7280' : '#e8b89d' }} />
                      <div style={{ position: 'absolute', top: 40, left: 4, width: 44, height: 32, background: isOffline ? '#374151' : '#1e3a5f' }} />
                      {/* Status dot */}
                      <div style={{ 
                        position: 'absolute', top: -8, right: -8, width: 14, height: 14, borderRadius: '50%', 
                        background: isWorking ? '#10b981' : isIdle ? '#8b949e' : '#f85149', 
                        border: '2px solid #111827',
                        boxShadow: isWorking ? '0 0 8px #10b981' : 'none',
                        animation: isWorking ? 'pulse 2s infinite' : 'none'
                      }} />
                    </div>
                  )}
                  {desk.name === 'Orbit' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      {!isOffline && <div style={{ position: 'absolute', top: 0, left: 8, width: 36, height: 20, border: '2px solid #fb923c', borderRadius: '50% 50% 0 0', borderBottom: 'none' }} />}
                      <div style={{ position: 'absolute', top: 6, left: 6, width: 40, height: 8, background: isOffline ? '#4b5563' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 12, left: 10, width: 32, height: 28, background: isOffline ? '#6b7280' : '#fcd9b6' }} />
                      <div style={{ position: 'absolute', top: 20, left: 14, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 20, left: 26, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      {!isOffline && <div style={{ position: 'absolute', top: 20, left: 2, width: 6, height: 8, background: desk.color }} />}
                      <div style={{ position: 'absolute', top: 38, left: 20, width: 12, height: 8, background: isOffline ? '#6b7280' : '#e8b89d' }} />
                      <div style={{ position: 'absolute', top: 44, left: 4, width: 44, height: 32, background: isOffline ? '#374151' : '#292524' }} />
                      {!isOffline && (
                        <>
                          <div style={{ position: 'absolute', top: 44, left: 4, width: 44, height: 5, background: desk.color }} />
                          <div style={{ position: 'absolute', top: 52, left: 4, width: 44, height: 4, background: desk.color }} />
                        </>
                      )}
                      {/* Status dot */}
                      <div style={{ 
                        position: 'absolute', top: -8, right: -8, width: 14, height: 14, borderRadius: '50%', 
                        background: isWorking ? '#10b981' : isIdle ? '#8b949e' : '#f85149', 
                        border: '2px solid #111827',
                        boxShadow: isWorking ? '0 0 8px #10b981' : 'none',
                        animation: isWorking ? 'pulse 2s infinite' : 'none'
                      }} />
                    </div>
                  )}
                </div>
                
                {/* Desk with monitor glow */}
                <div style={{ 
                  position: 'absolute', top: 50, width: 160, height: 80, 
                  background: isOffline ? '#1a1a1a' : '#252525', 
                  border: `2px solid ${isOffline ? '#ef4444' : isWorking ? '#10b981' : '#3a3a3a'}`, 
                  borderRadius: 8, 
                  boxShadow: isWorking ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                }}>
                  {/* Monitor with glow */}
                  <div style={{ 
                    position: 'absolute', top: -35, left: 50, width: 60, height: 40, 
                    background: isOffline ? '#0a0a0a' : isWorking ? '#0d2b0d' : '#0d1b2a', 
                    border: '1px solid #444', 
                    borderRadius: 4, 
                    boxShadow: isWorking ? '0 0 12px #10b981, inset 0 0 8px rgba(16, 185, 129, 0.2)' : isIdle ? '0 0 6px rgba(88, 166, 255, 0.3), inset 0 0 4px rgba(88, 166, 255, 0.1)' : 'none'
                  }}>
                    {/* Animated cursor when working */}
                    {isWorking && (
                      <div style={{ 
                        position: 'absolute', top: 8, left: 8, width: 4, height: 8, background: '#10b981',
                        animation: 'blink 1s infinite'
                      }} />
                    )}
                  </div>
                  {/* Monitor stand */}
                  <div style={{ position: 'absolute', top: 5, left: 70, width: 20, height: 12, background: '#333' }} />
                  {isWorking && <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite' }} />}
                </div>
                
                {/* Name and task count */}
                <div style={{ position: 'absolute', top: 145, left: 0, width: 160, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: desk.color }}>
                    {desk.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>
                    <span style={{ color: desk.color }}>{taskCounts[desk.name] || 0}</span> tasks today
                  </div>
                </div>
                
                {/* Task bubble */}
                {task && task !== 'idle' && (
                  <div style={{ position: 'absolute', top: -20, left: 80, background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 10, whiteSpace: 'nowrap', color: '#1a1a1a' }}>
                    {task.substring(0, 20)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Time indicator */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: 6, fontSize: 11, color: '#888' }}>
          {timeOfDay === 'day' ? '☀️ Day' : timeOfDay === 'evening' ? '🌆 Evening' : '🌙 Night'}
        </div>
      </div>
      
      {/* Activity Ticker */}
      <div style={{ marginTop: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>📢 LIVE ACTIVITY</div>
        <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <span style={{ fontSize: 12, color: '#10b981' }}>🟢 All agents standing by</span>
          ) : (
            logs.slice(0, 5).map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.log_type === 'error' ? '#ef4444' : log.log_type === 'task' ? '#3b82f6' : '#10b981' }} />
                <span style={{ fontSize: 12, color: '#aaa' }}>
                  {log.agent?.name || 'System'}: {log.message?.substring(0, 30)}...
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
