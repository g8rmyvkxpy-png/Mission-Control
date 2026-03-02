'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:60,background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/dashboard" style={{textDecoration:'none'}}><span style={{fontSize:24}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:18}}>Settings</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Settings ⚙️</h1>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:24}}>Configure your workspace</p>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,overflow:'hidden',marginBottom:16}}>
          <Link href="/account" style={{padding:16,borderBottom:'1px solid #21262d',display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Profile</p><p style={{fontSize:12,color:'#6e7681'}}>deva@example.com</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
          <Link href="/billing" style={{padding:16,borderBottom:'1px solid #21262d',display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Organization</p><p style={{fontSize:12,color:'#6e7681'}}>PP Ventures</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
          <div style={{padding:16,borderBottom:'1px solid #21262d',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>API Keys</p><p style={{fontSize:12,color:'#6e7681'}}>Manage your API keys</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </div>
          <Link href="/notifications" style={{padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Notifications</p><p style={{fontSize:12,color:'#6e7681'}}>Email & push notifications</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
        </div>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,overflow:'hidden'}}>
          <Link href="/billing" style={{padding:16,borderBottom:'1px solid #21262d',display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Billing</p><p style={{fontSize:12,color:'#6e7681'}}>Manage subscription</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
          <Link href="/integrations" style={{padding:16,borderBottom:'1px solid #21262d',display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Integrations</p><p style={{fontSize:12,color:'#6e7681'}}>Connected services</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
          <Link href="/team" style={{padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none',color:'inherit'}}>
            <div><p style={{fontWeight:600,fontSize:14}}>Team</p><p style={{fontSize:12,color:'#6e7681'}}>Manage team members</p></div>
            <span style={{color:'#2f81f7',fontSize:14}}>→</span>
          </Link>
        </div>

        {/* Quick Links */}
        <h2 style={{fontSize:18,fontWeight:600,margin:'24px 0 12px'}}>Quick Access</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Link href="/tasks" style={{padding:16,background:'#0f1117',borderRadius:12,textDecoration:'none',color:'inherit',border:'1px solid #21262d'}}>
            <span style={{fontSize:24}}>📋</span>
            <p style={{fontWeight:600,fontSize:14,marginTop:8}}>Tasks</p>
          </Link>
          <Link href="/content" style={{padding:16,background:'#0f1117',borderRadius:12,textDecoration:'none',color:'inherit',border:'1px solid #21262d'}}>
            <span style={{fontSize:24}}>📝</span>
            <p style={{fontWeight:600,fontSize:14,marginTop:8}}>Content</p>
          </Link>
          <Link href="/workflows" style={{padding:16,background:'#0f1117',borderRadius:12,textDecoration:'none',color:'inherit',border:'1px solid #21262d'}}>
            <span style={{fontSize:24}}>🔄</span>
            <p style={{fontWeight:600,fontSize:14,marginTop:8}}>Workflows</p>
          </Link>
          <Link href="/analytics" style={{padding:16,background:'#0f1117',borderRadius:12,textDecoration:'none',color:'inherit',border:'1px solid #21262d'}}>
            <span style={{fontSize:24}}>📊</span>
            <p style={{fontWeight:600,fontSize:14,marginTop:8}}>Analytics</p>
          </Link>
        </div>
      </div>

      <div style={{display:'flex',position:'fixed',bottom:0,left:0,right:0,height:65,background:'#0f1117',borderTop:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-around',zIndex:1000}}>
        <Link href="/dashboard" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🏠</span><span style={{fontSize:10}}>Home</span></Link>
        <Link href="/tasks" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>📋</span><span style={{fontSize:10}}>Tasks</span></Link>
        <Link href="/agents" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🤖</span><span style={{fontSize:10}}>Agents</span></Link>
        <Link href="/settings" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#2f81f7',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>⚙️</span><span style={{fontSize:10}}>Settings</span></Link>
      </div>
    </div>
  );
}
