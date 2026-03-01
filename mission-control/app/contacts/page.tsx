'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CONTACTS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', company: 'TechCorp', role: 'CTO' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'StartupXYZ', role: 'CEO' },
  { id: '3', name: 'Mike Chen', email: 'mike@enterprise.co', company: 'Enterprise Inc', role: 'VP Engineering' },
  { id: '4', name: 'Emily Davis', email: 'emily@growth.com', company: 'Growth Labs', role: 'Product Lead' },
];

export default function ContactsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:60,background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/" style={{textDecoration:'none'}}><span style={{fontSize:24}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:18}}>Contacts</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Contacts 📒</h1>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:24}}>{CONTACTS.length} contacts in your network</p>

        <div style={{background:'#0f1117',border:'1px solid #21262d',borderRadius:12,overflow:'hidden'}}>
          {CONTACTS.map(contact => (
            <div key={contact.id} style={{display:'flex',alignItems:'center',gap:12,padding:16,borderBottom:'1px solid #21262d'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#21262d',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:16}}>{contact.name[0]}</div>
              <div style={{flex:1}}>
                <p style={{fontWeight:600,fontSize:14}}>{contact.name}</p>
                <p style={{fontSize:12,color:'#6e7681'}}>{contact.role} at {contact.company}</p>
                <p style={{fontSize:11,color:'#484f58',marginTop:2}}>{contact.email}</p>
              </div>
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
