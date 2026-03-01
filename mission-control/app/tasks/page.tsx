'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header" style={{display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000}}>
        <Link href="/" style={{textDecoration: 'none'}}><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Tasks</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Tasks 📋</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Create and manage AI tasks</p>
          </div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Create Task Card */}
        <div className="card" style={{padding: 24, marginBottom: 24}}>
          <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 16}}>⚡ Create New Task</h2>
          <form method="POST" action="/api/tasks/auto" style={{display: 'flex', gap: 12}}>
            <input type="text" name="title" placeholder="What do you need?" style={{flex: 1, padding: '14px 20px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 15}} required />
            <input type="hidden" name="auto_execute" value="true" />
            <input type="hidden" name="organization_id" value="56b94071-3455-4967-9300-60788486a4fb" />
            <button type="submit" style={{padding: '14px 32px', background: '#2f81f7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer'}}>🚀 Execute</button>
          </form>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Total</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>127</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Completed</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>125</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Processing</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7'}}>1</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Pending</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#d29922'}}>1</p></div>
        </div>

        {/* Tasks Table */}
        <div className="card" style={{padding: 24}}>
          <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 20}}>Recent Tasks</h2>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #21262d'}}>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>TASK</th>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>AGENT</th>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: 'Research AI trends', agent: 'Sales Scout', status: 'completed', icon: '📋' },
                { title: 'Write blog post', agent: 'Content Writer', status: 'processing', icon: '✍️' },
                { title: 'Send outreach', agent: 'Outreach Pro', status: 'pending', icon: '📧' },
              ].map((task, i) => (
                <tr key={i} style={{borderBottom: i < 2 ? '1px solid #21262d' : 'none'}}>
                  <td style={{padding: '16px 0', display: 'flex', alignItems: 'center', gap: 12}}><span style={{fontSize: 20}}>{task.icon}</span><span style={{fontWeight: 500}}>{task.title}</span></td>
                  <td style={{padding: '16px 0', color: '#8b949e'}}>{task.agent}</td>
                  <td style={{padding: '16px 0'}}><span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: task.status === 'completed' ? 'rgba(63,185,80,0.15)' : task.status === 'processing' ? 'rgba(47,129,247,0.15)' : 'rgba(210,153,34,0.15)', color: task.status === 'completed' ? '#3fb950' : task.status === 'processing' ? '#2f81f7' : '#d29922'}}>{task.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#2f81f7', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>Settings</span></Link>
      </div>
    </div>
  );
}
