'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AgentsPage() {
  const agents = [
    { name: 'Sales Scout', description: 'Researches leads and prospects', status: 'active', tasks: 45, icon: '🎯' },
    { name: 'Content Writer', description: 'Creates blog posts and content', status: 'active', tasks: 38, icon: '✍️' },
    { name: 'Outreach Pro', description: 'Sends personalized outreach', status: 'inactive', tasks: 24, icon: '📧' },
  ];

  return (
    <div className="page">
      <div className="mobile-header" style={{display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000}}>
        <Link href="/" style={{textDecoration: 'none'}}><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Agents</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div><h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>AI Agents 🤖</h1><p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Your AI workforce</p></div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back</Link>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24}}>
          {agents.map((agent, i) => (
            <div key={i} className="card" style={{padding: 24}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
                <span style={{fontSize: 40}}>{agent.icon}</span>
                <div style={{flex: 1}}><p style={{fontWeight: 600, fontSize: 18, margin: 0}}>{agent.name}</p><p style={{color: '#8b949e', fontSize: 13, margin: '4px 0 0'}}>{agent.description}</p></div>
                <span style={{padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: agent.status === 'active' ? 'rgba(63,185,80,0.15)' : 'rgba(110,118,128,0.15)', color: agent.status === 'active' ? '#3fb950' : '#8b949e'}}>{agent.status}</span>
              </div>
              <div style={{display: 'flex', gap: 16, fontSize: 13, color: '#8b949e'}}><span>📊 {agent.tasks} tasks</span></div>
            </div>
          ))}
        </div>

        <button className="btn" style={{width: 'auto', padding: '14px 32px'}}>+ Deploy New Agent</button>
      </div>

      <div className="mobile-nav" style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#2f81f7', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>Settings</span></Link>
      </div>
    </div>
  );
}
