'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const DEMO_LEADS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', company: 'TechCorp', status: 'qualified', score: 85 },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'StartupXYZ', status: 'contacted', score: 72 },
  { id: '3', name: 'Mike Chen', email: 'mike@enterprise.co', company: 'Enterprise Inc', status: 'new', score: 90 },
];

export default function LeadsPage() {
  return (
    <div className="page">
      <div className="mobile-header" style={{display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000}}>
        <Link href="/" style={{textDecoration: 'none'}}><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Leads</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div><h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Leads 👥</h1><p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Track and manage your prospects</p></div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back</Link>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Total</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>{DEMO_LEADS.length}</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Qualified</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{DEMO_LEADS.filter(l => l.status === 'qualified').length}</p></div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}><span style={{fontSize: 12, color: '#8b949e'}}>Contacted</span><p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7'}}>{DEMO_LEADS.filter(l => l.status === 'contacted').length}</p></div>
        </div>

        <div className="card" style={{padding: 24}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #21262d'}}>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>CONTACT</th>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>COMPANY</th>
                <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_LEADS.map(lead => (
                <tr key={lead.id} style={{borderBottom: '1px solid #21262d'}}>
                  <td style={{padding: '16px 0', display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: '50%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600}}>{lead.name[0]}</div>
                    <div><p style={{fontWeight: 600, margin: 0}}>{lead.name}</p><p style={{color: '#8b949e', fontSize: 12, margin: 0}}>{lead.email}</p></div>
                  </td>
                  <td style={{padding: '16px 0', color: '#8b949e'}}>{lead.company}</td>
                  <td style={{padding: '16px 0'}}><span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: lead.status === 'qualified' ? 'rgba(63,185,80,0.15)' : lead.status === 'contacted' ? 'rgba(47,129,247,0.15)' : 'rgba(210,153,34,0.15)', color: lead.status === 'qualified' ? '#3fb950' : lead.status === 'contacted' ? '#2f81f7' : '#d29922'}}>{lead.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mobile-nav" style={{display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, height: 65, background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000}}>
        <Link href="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#8b949e', textDecoration: 'none', fontSize: 12}}><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>Settings</span></Link>
      </div>
    </div>
  );
}
