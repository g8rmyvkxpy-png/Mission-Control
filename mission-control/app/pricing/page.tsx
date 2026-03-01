'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:60,background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:24}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:18}}>Pricing</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Pricing 💰</h1>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:24}}>Choose the plan that fits your needs</p>

        <div style={{background:'linear-gradient(135deg,#0f1117,rgba(47,129,247,0.1))',border:'2px solid #2f81f7',borderRadius:16,padding:24,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div><h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Pro</h2><p style={{color:'#8b949e',fontSize:14}}>For growing teams</p></div>
            <div style={{textAlign:'right'}}><p style={{fontSize:32,fontWeight:700}}>$29</p><p style={{color:'#8b949e',fontSize:12}}>/month</p></div>
          </div>
          <ul style={{listStyle:'none',padding:0,margin:'0 0 20px 0'}}>
            {['Unlimited tasks', '5 AI Agents', 'Priority support', 'Analytics dashboard', 'API access'].map((feat, i) => (
              <li key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',fontSize:14}}>✅ {feat}</li>
            ))}
          </ul>
          <button style={{width:'100%',padding:14,background:'#2f81f7',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:14,cursor:'pointer'}}>Get Started</button>
        </div>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:16,padding:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div><h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Starter</h2><p style={{color:'#8b949e',fontSize:14}}>For individuals</p></div>
            <div style={{textAlign:'right'}}><p style={{fontSize:32,fontWeight:700}}>$9</p><p style={{color:'#8b949e',fontSize:12}}>/month</p></div>
          </div>
          <ul style={{listStyle:'none',padding:0,margin:'16px 0 20px 0'}}>
            {['100 tasks/month', '2 AI Agents', 'Basic analytics', 'Email support'].map((feat, i) => (
              <li key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',fontSize:14,color:'#8b949e'}}>✓ {feat}</li>
            ))}
          </ul>
          <button style={{width:'100%',padding:14,background:'#21262d',color:'#f0f6fc',border:'none',borderRadius:8,fontWeight:600,fontSize:14,cursor:'pointer'}}>Get Started</button>
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
