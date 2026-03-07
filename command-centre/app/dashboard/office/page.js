'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OfficePage() {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState('day');
  
  const desks = [
    { name: 'Neo', color: '#10b981' },
    { name: 'Atlas', color: '#3b82f6' },
    { name: 'Orbit', color: '#f97316' }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) setTimeOfDay('day');
    else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
    else setTimeOfDay('night');
    
    fetchData();
    
    const agentsChannel = supabase
      .channel('office-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchAgents)
      .subscribe();
    
    const logsChannel = supabase
      .channel('office-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, fetchLogs)
      .subscribe();
    
    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, []);

  async function fetchData() {
    await Promise.all([fetchAgents(), fetchLogs()]);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function fetchLogs() {
    const res = await fetch('/api/logs?limit=20');
    const data = await res.json();
    const allLogs = data.logs || [];
    const meaningfulLogs = allLogs.filter(log => {
      const msg = log.message?.toLowerCase() || '';
      return !msg.includes('heartbeat') && !msg.includes('waiting') && !msg.includes('polling') && !msg.includes('idle');
    });
    setLogs(meaningfulLogs.slice(0, 8));
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
      
      {/* Fix 1 & 5: Full office space with visible grid */}
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
        
        {/* Fix 2 & 4: Server Room - top right, larger */}
        <div style={{ position: 'absolute', right: 20, top: 20, width: 180, height: 160, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>🖥️ Server Room</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 24, background: Math.sin(Date.now()/500 + i) > 0 ? '#10b981' : '#064e3b', borderRadius: 3 }} />
            ))}
          </div>
        </div>
        
        {/* Fix 2 & 4: Water Cooler - bottom left, larger */}
        <div style={{ position: 'absolute', left: 20, bottom: 20, width: 150, height: 160, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>💧 Water Cooler</div>
          <div style={{ width: 50, height: 70, background: '#3b82f6', margin: '0 auto', borderRadius: 6 }} />
        </div>
        
        {/* Fix 2 & 4: Break Room - bottom right, larger */}
        <div style={{ position: 'absolute', right: 20, bottom: 20, width: 180, height: 160, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>☕ Break Room</div>
          <div style={{ height: 50, background: '#f59e0b', borderRadius: 6, marginTop: 20 }} />
        </div>
        
        {/* Fix 3: Three desks centered horizontally, upper half */}
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
            const isWorking = status === 'working' || (task && task !== 'idle');
            const isOnline = status === 'online' || status === 'working';
            const isOffline = status === 'offline';
            
            return (
              <div key={desk.name} style={{ width: 160, position: 'relative' }}>
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
                      {!isOffline && <div style={{ position: 'absolute', top: 42, left: 22, width: 8, height: 20, background: '#10b981' }} />}
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 12, height: 12, borderRadius: '50%', background: isWorking ? '#10b981' : isOnline ? '#f59e0b' : '#6b7280', border: '2px solid #111827' }} />
                    </div>
                  )}
                  {desk.name === 'Atlas' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: -2, left: 6, width: 40, height: 14, background: isOffline ? '#4b5563' : '#4a3728' }} />
                      <div style={{ position: 'absolute', top: -4, left: 30, width: 6, height: 6, background: isOffline ? '#4b5563' : '#4a3728' }} />
                      <div style={{ position: 'absolute', top: -3, left: 10, width: 5, height: 5, background: isOffline ? '#4b5563' : '#4a3728' }} />
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
                      {!isOffline && <div style={{ position: 'absolute', top: 56, left: 16, width: 16, height: 10, background: '#172554' }} />}
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 12, height: 12, borderRadius: '50%', background: isWorking ? '#10b981' : isOnline ? '#f59e0b' : '#6b7280', border: '2px solid #111827' }} />
                    </div>
                  )}
                  {desk.name === 'Orbit' && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      {!isOffline && <div style={{ position: 'absolute', top: 0, left: 8, width: 36, height: 20, border: '2px solid #fb923c', borderRadius: '50% 50% 0 0', borderBottom: 'none' }} />}
                      <div style={{ position: 'absolute', top: 6, left: 6, width: 40, height: 8, background: isOffline ? '#4b5563' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 12, left: 10, width: 32, height: 28, background: isOffline ? '#6b7280' : '#fcd9b6' }} />
                      <div style={{ position: 'absolute', top: 20, left: 14, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      <div style={{ position: 'absolute', top: 20, left: 26, width: 4, height: 4, background: isOffline ? '#9ca3af' : '#1a1a1a' }} />
                      {!isOffline && <div style={{ position: 'absolute', top: 20, left: 2, width: 6, height: 8, background: '#f97316' }} />}
                      <div style={{ position: 'absolute', top: 38, left: 20, width: 12, height: 8, background: isOffline ? '#6b7280' : '#e8b89d' }} />
                      <div style={{ position: 'absolute', top: 44, left: 4, width: 44, height: 32, background: isOffline ? '#374151' : '#292524' }} />
                      {!isOffline && (
                        <>
                          <div style={{ position: 'absolute', top: 44, left: 4, width: 44, height: 5, background: '#f97316' }} />
                          <div style={{ position: 'absolute', top: 52, left: 4, width: 44, height: 4, background: '#f97316' }} />
                        </>
                      )}
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 12, height: 12, borderRadius: '50%', background: isWorking ? '#10b981' : isOnline ? '#f59e0b' : '#6b7280', border: '2px solid #111827' }} />
                    </div>
                  )}
                </div>
                
                {/* Desk */}
                <div style={{ position: 'absolute', top: 50, width: 160, height: 80, background: isOffline ? '#1a1a1a' : '#252525', border: `2px solid ${isOffline ? '#ef4444' : isWorking ? '#10b981' : '#3a3a3a'}`, borderRadius: 8, boxShadow: isWorking ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none' }}>
                  <div style={{ position: 'absolute', top: -35, left: 50, width: 60, height: 40, background: isOffline ? '#0a0a0a' : isWorking ? '#3b82f6' : '#1a1a1a', border: '1px solid #444', borderRadius: 4, boxShadow: isWorking ? '0 0 15px rgba(59, 130, 246, 0.8)' : 'none' }} />
                  <div style={{ position: 'absolute', top: 5, left: 70, width: 20, height: 12, background: '#333' }} />
                  {isWorking && <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite' }} />}
                </div>
                
                {/* Name */}
                <div style={{ position: 'absolute', top: 145, left: 0, width: 160, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: desk.color }}>
                  {desk.name}
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
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.log_type === 'error' ? '#ef4444' : log.log_type === 'task' ? '#3b82f6' : '#10b981' }} />
                <span style={{ fontSize: 12, color: '#aaa' }}>{log.agent?.name || 'System'}: {log.message?.substring(0, 25)}...</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
