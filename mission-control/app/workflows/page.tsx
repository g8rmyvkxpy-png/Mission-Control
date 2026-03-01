'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const WORKFLOWS = [
  { id: '1', name: 'Lead Generation', status: 'active', runs: 12, lastRun: '2 hours ago', description: 'Automatically find and capture leads' },
  { id: '2', name: 'Content Publishing', status: 'active', runs: 8, lastRun: '1 day ago', description: 'Schedule and publish content' },
  { id: '3', name: 'Customer Follow-up', status: 'paused', runs: 24, lastRun: '3 days ago', description: 'Follow up with customers automatically' },
  { id: '4', name: 'Report Generation', status: 'inactive', runs: 5, lastRun: '1 week ago', description: 'Weekly analytics reports' },
];

export default function WorkflowsPage() {
  return (
    <div style={container}>
      <div style={header}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:'24px'}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:'18px'}}>Workflows</span>
        <div style={avatar}>D</div>
      </div>

      <div style={main}>
        <h1 style={title}>Workflows 🔄</h1>
        <p style={subtitle}>Automate your business processes</p>

        <button style={addBtn}>+ Create Workflow</button>

        <div style={list}>
          {WORKFLOWS.map((wf, i) => (
            <div key={i} style={item}>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,fontSize:'15px',marginBottom:'4px'}}>{wf.name}</p>
                <p style={{fontSize:'12px',color:'#6e7681',marginBottom:'8px'}}>{wf.description}</p>
                <div style={{display:'flex',gap:'12px',fontSize:'11px',color:'#8b949e'}}>
                  <span>📊 {wf.runs} runs</span>
                  <span>⏰ {wf.lastRun}</span>
                </div>
              </div>
              <span style={{
                padding:'6px 12px',
                borderRadius:'20px',
                fontSize:'11px',
                fontWeight:600,
                background: wf.status === 'active' ? 'rgba(63,185,80,0.15)' : wf.status === 'paused' ? 'rgba(210,153,34,0.15)' : 'rgba(110,118,128,0.15)',
                color: wf.status === 'active' ? '#3fb950' : wf.status === 'paused' ? '#d29922' : '#8b949e'
              }}>
                {wf.status}
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
const subtitle = { color:'#8b949e',fontSize:'14px',marginBottom:'20px' };
const addBtn: React.CSSProperties = { width:'100%',padding:'14px',background:'#2f81f7',color:'#fff',border:'none',borderRadius:'10px',fontWeight:600,fontSize:'14px',cursor:'pointer',marginBottom:'20px' };
const list = { background:'#0f1117',border:'1px solid #21262d',borderRadius:'12px',overflow:'hidden' };
const item = { display:'flex',alignItems:'flex-start',gap:'12px',padding:'16px',borderBottom:'1px solid #21262d' };
const bottomNav: React.CSSProperties = { display:'flex',position:'fixed',bottom:0,left:0,right:0,height:'65px',background:'#0f1117',borderTop:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-around',zIndex:1000 };
const navItem = { display:'flex',flexDirection:'column' as const,alignItems:'center',gap:'4px',color:'#8b949e',textDecoration:'none',fontSize:'12px' };
