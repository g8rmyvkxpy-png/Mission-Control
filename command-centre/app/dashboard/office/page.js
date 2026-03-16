'use client';
import { useState, useEffect } from 'react';

export default function OfficePage() {
  const [stats, setStats] = useState({ tasks: 0, goals: 0, agents: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => {
      setStats(s => ({ ...s, tasks: (d.tasks || []).length }));
    }).catch(() => {});
    
    fetch('/api/goals').then(r => r.json()).then(d => {
      setStats(s => ({ ...s, goals: (d.goals || []).length }));
    }).catch(() => {});
    
    fetch('/api/agents').then(r => r.json()).then(d => {
      setStats(s => ({ ...s, agents: (d.agents || []).length }));
    }).catch(() => {});
    
    fetch('/api/revenue').then(r => r.json()).then(d => {
      const rev = d.entries || d.revenue || [];
      const total = rev.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      setStats(s => ({ ...s, revenue: total }));
    }).catch(() => {});
    
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#666'}}>Loading...</div>;

  return (
    <div style={{padding:20,background:'#0a0a15',minHeight:'calc(100vh - 120px)',color:'#fff'}}>
      <h1 style={{fontSize:24,marginBottom:20}}>🏢 PPVentures Office</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #10b981'}}>
          <div style={{color:'#888',fontSize:11}}>💰 REVENUE</div>
          <div style={{fontSize:28,fontWeight:700}}>${stats.revenue.toLocaleString()}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #3b82f6'}}>
          <div style={{color:'#888',fontSize:11}}>📋 TASKS</div>
          <div style={{fontSize:28,fontWeight:700}}>{stats.tasks}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #8b5cf6'}}>
          <div style={{color:'#888',fontSize:11}}>🎯 GOALS</div>
          <div style={{fontSize:28,fontWeight:700}}>{stats.goals}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #f59e0b'}}>
          <div style={{color:'#888',fontSize:11}}>🤖 AGENTS</div>
          <div style={{fontSize:28,fontWeight:700}}>{stats.agents}</div>
        </div>
      </div>
    </div>
  );
}
