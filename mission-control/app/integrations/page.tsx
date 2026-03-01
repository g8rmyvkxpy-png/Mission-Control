'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const INTEGRATIONS = [
  { name: 'Stripe', status: 'connected', icon: '💳', desc: 'Payment processing' },
  { name: 'Slack', status: 'available', icon: '💬', desc: 'Team messaging' },
  { name: 'GitHub', status: 'available', icon: '🐙', desc: 'Code repository' },
  { name: 'Google Workspace', status: 'available', icon: '📧', desc: 'Email & docs' },
  { name: 'Zapier', status: 'available', icon: '⚡', desc: 'Automation' },
  { name: 'Notion', status: 'available', icon: '📝', desc: 'Knowledge base' },
];

export default function IntegrationsPage() {
  return (
    <div style={container}>
      <div style={header}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:'24px'}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:'18px'}}>Integrations</span>
        <div style={avatar}>D</div>
      </div>

      <div style={main}>
        <h1 style={title}>Integrations 🔌</h1>
        <p style={subtitle}>Connect your favorite tools</p>

        <div style={list}>
          {INTEGRATIONS.map((int, i) => (
            <div key={i} style={item}>
              <div style={iconBox}>{int.icon}</div>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,fontSize:'14px'}}>{int.name}</p>
                <p style={{fontSize:'12px',color:'#6e7681'}}>{int.desc}</p>
              </div>
              <span style={{
                padding:'6px 12px',
                borderRadius:'20px',
                fontSize:'12px',
                fontWeight:600,
                background: int.status === 'connected' ? 'rgba(63,185,80,0.15)' : 'rgba(110,118,128,0.15)',
                color: int.status === 'connected' ? '#3fb950' : '#8b949e'
              }}>
                {int.status === 'connected' ? 'Connected' : 'Connect'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={bottomNav}>
        <Link href="/" style={navItem}><span style={{fontSize:'20px'}}>🏠</span><span style={{fontSize:'10px'}}>Home</span></Link>
        <Link href="/tasks" style={navItem}><span style={{fontSize:'20px'}}>📋</span><span style={{fontSize:'10px'}}>Tasks</span></Link>
        <Link href="/agents" style={navItem}><span style={{fontSize:'20px'}}>🤖</span><span style={{fontSize:'10px'}}>Agents</span></Link>
        <Link href="/settings" style={navItem}><span style={{fontSize:'20px'}}>⚙️</span><span style={{fontSize:'10px'}}>Settings</span></Link>
      </div>
    </div>
  );
}

const container = { minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px' };
const header: React.CSSProperties = { display:'flex',position:'fixed',top:0,left:0,right:0,height:'60px',background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000 };
const avatar = { width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:'12px' };
const main = { padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto' };
const title = { fontSize:'24px',fontWeight:700,marginBottom:'4px' };
const subtitle = { color:'#8b949e',fontSize:'14px',marginBottom:'24px' };
const list = { background:'#0f1117',border:'1px solid #21262d',borderRadius:'12px',overflow:'hidden' };
const item = { display:'flex',alignItems:'center',gap:'12px',padding:'16px',borderBottom:'1px solid #21262d' };
const iconBox = { width:'44px',height:'44px',borderRadius:'10px',background:'#21262d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px' };
const bottomNav: React.CSSProperties = { display:'flex',position:'fixed',bottom:0,left:0,right:0,height:'65px',background:'#0f1117',borderTop:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-around',zIndex:1000 };
const navItem: React.CSSProperties = { display:'flex',flexDirection:'column' as const,alignItems:'center',gap:'4px',color:'#8b949e',textDecoration:'none',fontSize:'12px' };
