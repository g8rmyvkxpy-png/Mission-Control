'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function UsagePage() {
  const usage = {
    tasks: { used: 45, limit: 100, plan: 'Starter' },
    agents: { used: 2, limit: 2, plan: 'Starter' },
    storage: { used: 0.3, limit: 1, plan: 'GB' },
    apiCalls: { used: 1234, limit: 5000, plan: '' },
  };

  return (
    <div className="page">
      <div className="mobile-header">
        <Link href="/"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Usage</span>
        <div className="avatar">D</div>
      </div>

      <div className="page-content">
        <div className="desktop-show" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1>Usage & Billing 💳</h1>
            <p>Monitor your resource usage</p>
          </div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back</Link>
        </div>

        {/* Current Plan */}
        <div className="card mb-24">
          <div className="flex-between">
            <div>
              <p style={{color: '#8b949e', fontSize: 12, marginBottom: 4}}>CURRENT PLAN</p>
              <h2 style={{margin: 0}}>Starter Plan</h2>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          <div style={{marginTop: 24, paddingTop: 24, borderTop: '1px solid #21262d'}}>
            <p style={{color: '#8b949e', fontSize: 12, marginBottom: 8}}>Next billing date: March 28, 2026</p>
            <Link href="/pricing" className="btn" style={{textDecoration: 'none', display: 'inline-block'}}>Upgrade Plan →</Link>
          </div>
        </div>

        {/* Usage Stats */}
        <h2 style={{marginBottom: 16}}>Resource Usage</h2>
        <div style={{display: 'grid', gap: 16, marginBottom: 24}}>
          {[
            { label: 'Tasks', used: usage.tasks.used, limit: usage.tasks.limit, icon: '📋' },
            { label: 'AI Agents', used: usage.agents.used, limit: usage.agents.limit, icon: '🤖' },
            { label: 'Storage', used: usage.storage.used, limit: usage.storage.limit, unit: 'GB', icon: '💾' },
            { label: 'API Calls', used: usage.apiCalls.used, limit: usage.apiCalls.limit, icon: '🔌' },
          ].map((item, i) => {
            const percent = Math.min((item.used / item.limit) * 100, 100);
            const isNearLimit = percent > 80;
            return (
              <div key={i} className="card">
                <div className="flex-between mb-12">
                  <div className="flex gap-12" style={{alignItems: 'center'}}>
                    <span style={{fontSize: 24}}>{item.icon}</span>
                    <span style={{fontWeight: 600}}>{item.label}</span>
                  </div>
                  <span style={{color: isNearLimit ? '#d29922' : '#8b949e', fontSize: 14}}>
                    {item.used} / {item.limit}{item.unit || ''}
                  </span>
                </div>
                <div style={{background: '#21262d', borderRadius: 4, height: 8, overflow: 'hidden'}}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: isNearLimit ? '#d29922' : '#2f81f7',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage History */}
        <h2 style={{marginBottom: 16}}>This Month</h2>
        <div className="card">
          <table>
            <tbody>
              {[
                { date: 'Mar 1', tasks: 12, agents: 'Sales Scout', status: 'completed' },
                { date: 'Mar 1', tasks: 8, agents: 'Content Writer', status: 'completed' },
                { date: 'Mar 1', tasks: 15, agents: 'Outreach Pro', status: 'completed' },
                { date: 'Feb 28', tasks: 22, agents: 'Sales Scout', status: 'completed' },
                { date: 'Feb 28', tasks: 18, agents: 'Content Writer', status: 'completed' },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{color: '#8b949e'}}>{row.date}</td>
                  <td>{row.tasks} tasks</td>
                  <td>{row.agents}</td>
                  <td><span className="badge badge-success">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-nav">
        <Link href="/" className="nav-link"><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" className="nav-link"><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>Settings</span></Link>
      </div>
    </div>
  );
}
