'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const APIS = [
  { method: 'GET', path: '/api/tasks', desc: 'List all tasks' },
  { method: 'POST', path: '/api/tasks/auto', desc: 'Create and execute task' },
  { method: 'GET', path: '/api/agents', desc: 'List AI agents' },
  { method: 'GET', path: '/api/leads', desc: 'List leads' },
  { method: 'POST', path: '/api/leads', desc: 'Create lead' },
  { method: 'GET', path: '/api/contacts', desc: 'List contacts' },
  { method: 'GET', path: '/api/analytics', desc: 'Get analytics' },
];

export default function APIDocsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:'60px',background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:'24px'}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:'18px'}}>API Docs</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>API Documentation 📚</h1>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:24}}>Build with Mission Control</p>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,padding:20,marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Authentication</h2>
          <pre style={{background:'#030712',padding:12,borderRadius:8,fontSize:12,overflow:'auto'}}>Authorization: Bearer YOUR_API_KEY</pre>
        </div>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,padding:20,marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:600,marginBottom:12}}>Endpoints</h2>
          {APIS.map((api, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #21262d'}}>
              <span style={{padding:'4px 8px',borderRadius:4,fontSize:11,fontWeight:700,background:'rgba(63,185,80,0.15)',color:'#3fb950'}}>{api.method}</span>
              <span style={{flex:1,fontSize:13,fontFamily:'monospace'}}>{api.path}</span>
              <span style={{fontSize:12,color:'#6e7681'}}>{api.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',position:'fixed',bottom:0,left:0,right:0,height:65,background:'#0f1117',borderTop:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-around',zIndex:1000}}>
        <Link href="/" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🏠</span><span style={{fontSize:10}}>Home</span></Link>
        <Link href="/tasks" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>📋</span><span style={{fontSize:10}}>Tasks</span></Link>
        <Link href="/agents" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🤖</span><span style={{fontSize:10}}>Agents</span></Link>
        <Link href="/settings" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>⚙️</span><span style={{fontSize:10}}>Settings</span></Link>
      </div>
    </div>
  );
}
