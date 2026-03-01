'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:60,background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:24}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:18}}>Analytics</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Analytics 📊</h1>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:24}}>Track your AI workforce performance</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
          <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:10,padding:16,textAlign:'center'}}><span style={{fontSize:11,color:'#8b949e'}}>Tasks</span><p style={{fontSize:24,fontWeight:700,margin:'8px 0 0'}}>127</p></div>
          <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:10,padding:16,textAlign:'center'}}><span style={{fontSize:11,color:'#8b949e'}}>Success</span><p style={{fontSize:24,fontWeight:700,margin:'8px 0 0',color:'#3fb950'}}>97%</p></div>
          <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:10,padding:16,textAlign:'center'}}><span style={{fontSize:11,color:'#8b949e'}}>Avg Time</span><p style={{fontSize:24,fontWeight:700,margin:'8px 0 0',color:'#2f81f7'}}>2m</p></div>
        </div>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,padding:20,marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Weekly Activity</h2>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120}}>
            {[40,65,45,80,55,90,70].map((h,i)=><div key={i} style={{flex:1,background:'linear-gradient(180deg,#2f81f7,#a371f7)',borderRadius:4,height:`${h}%`}}></div>)}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:12,color:'#6e7681'}}><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </div>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,padding:20}}>
          <h2 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Top Agents</h2>
          {[
            { name: 'Sales Scout', tasks: 45, rate: '98%' },
            { name: 'Content Writer', tasks: 38, rate: '95%' },
          ].map((agent, i) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:i<1?'1px solid #21262d':'none'}}>
              <span style={{fontWeight:500}}>{agent.name}</span>
              <div style={{textAlign:'right'}}><span style={{color:'#8b949e',fontSize:13}}>{agent.tasks} tasks</span><span style={{marginLeft:12,color:'#3fb950',fontSize:13}}>{agent.rate}</span></div>
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
