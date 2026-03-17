'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfficePage() {
  const [stats, setStats] = useState({ tasks: 0, goals: 0, agents: 0, revenue: 0, clients: 0 });
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', company: '', status: 'new' });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tasksRes, goalsRes, agentsRes, revenueRes, clientsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/goals'),
        fetch('/api/agents'),
        fetch('/api/revenue'),
        fetch('/api/clients').catch(() => ({ json: () => ({ clients: [] }) }))
      ]);
      
      const tasksData = await tasksRes.json();
      const goalsData = await goalsRes.json();
      const agentsData = await agentsRes.json();
      const revenueData = await revenueRes.json();
      const clientsData = await clientsRes.json();
      
      const revenue = revenueData.entries || revenueData.revenue || [];
      const totalRevenue = revenue.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      
      setStats({
        tasks: (tasksData.tasks || []).length,
        goals: (goalsData.goals || []).length,
        agents: (agentsData.agents || []).length,
        revenue: totalRevenue,
        clients: (clientsData.clients || []).length
      });
      
      // Try to get leads from leads API
      try {
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
      } catch (e) {
        setLeads([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const addLead = async () => {
    if (!leadForm.name || !leadForm.email) return;
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm)
      });
      setShowLeadModal(false);
      setLeadForm({ name: '', email: '', company: '', status: 'new' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#666'}}>Loading...</div>;

  return (
    <div style={{padding:20,background:'#0a0a15',minHeight:'calc(100vh - 120px)',color:'#fff'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:24,margin:0}}>🏢 PPVentures Command Office</h1>
          <p style={{color:'#666',fontSize:12,margin:'4px 0 0'}}>Real-time company overview</p>
        </div>
        <button onClick={fetchData} style={{background:'#1a1a2e',border:'1px solid #333',borderRadius:8,padding:'8px 16px',color:'#888',cursor:'pointer',fontSize:12}}>
          🔄 Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{background:'#1a1a2e',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #333'}}>
        <div style={{fontSize:11,color:'#666',marginBottom:12}}>⚡ QUICK ACTIONS</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={() => router.push('/dashboard/board')} style={{background:'#0a0a15',border:'1px solid #3b82f6',borderRadius:8,padding:'12px 16px',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:20}}>✅</span>
            <span style={{fontSize:10,color:'#888'}}>New Task</span>
          </button>
          <button onClick={() => setShowLeadModal(true)} style={{background:'#0a0a15',border:'1px solid #10b981',borderRadius:8,padding:'12px 16px',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:20}}>👤</span>
            <span style={{fontSize:10,color:'#888'}}>Add Lead</span>
          </button>
          <button onClick={() => router.push('/dashboard/revenue')} style={{background:'#0a0a15',border:'1px solid #f59e0b',borderRadius:8,padding:'12px 16px',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:20}}>💰</span>
            <span style={{fontSize:10,color:'#888'}}>Add Revenue</span>
          </button>
          <button onClick={() => router.push('/dashboard/goals')} style={{background:'#0a0a15',border:'1px solid #8b5cf6',borderRadius:8,padding:'12px 16px',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:20}}>🎯</span>
            <span style={{fontSize:10,color:'#888'}}>Set Goal</span>
          </button>
          <button onClick={() => router.push('/dashboard/analytics')} style={{background:'#0a0a15',border:'1px solid #ec4899',borderRadius:8,padding:'12px 16px',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontSize:20}}>📊</span>
            <span style={{fontSize:10,color:'#888'}}>Analytics</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #10b981'}}>
          <div style={{color:'#888',fontSize:11}}>💰 REVENUE</div>
          <div style={{fontSize:24,fontWeight:700,color:'#10b981'}}>${stats.revenue.toLocaleString()}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #3b82f6'}}>
          <div style={{color:'#888',fontSize:11}}>📋 TASKS</div>
          <div style={{fontSize:24,fontWeight:700,color:'#3b82f6'}}>{stats.tasks}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #8b5cf6'}}>
          <div style={{color:'#888',fontSize:11}}>🎯 GOALS</div>
          <div style={{fontSize:24,fontWeight:700,color:'#8b5cf6'}}>{stats.goals}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #f59e0b'}}>
          <div style={{color:'#888',fontSize:11}}>🤖 AGENTS</div>
          <div style={{fontSize:24,fontWeight:700,color:'#f59e0b'}}>{stats.agents}</div>
        </div>
        <div style={{background:'#1a1a2e',padding:20,borderRadius:12,border:'1px solid #ec4899'}}>
          <div style={{color:'#888',fontSize:11}}>👥 CLIENTS</div>
          <div style={{fontSize:24,fontWeight:700,color:'#ec4899'}}>{stats.clients}</div>
        </div>
      </div>

      {/* Revenue Progress to $1M */}
      <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:12,padding:20,marginBottom:20,border:'1px solid #3b82f6'}}>
        <div style={{fontSize:12,color:'#888',marginBottom:8}}>🚀 PATH TO $1M ARR</div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{flex:1,height:8,background:'#333',borderRadius:4,overflow:'hidden'}}>
            <div style={{width:`${Math.min((stats.revenue/1000000)*100,100)}%`,height:'100%',background:'linear-gradient(90deg,#10b981,#3b82f6)',borderRadius:4}}></div>
          </div>
          <div style={{fontSize:14,fontWeight:600,color:'#3b82f6'}}>{((stats.revenue/1000000)*100).toFixed(2)}%</div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:10,color:'#666'}}>
          <span>$0</span>
          <span>$250K</span>
          <span>$500K</span>
          <span>$1M</span>
        </div>
      </div>

      {/* Leads Section */}
      <div style={{background:'#1a1a2e',borderRadius:12,padding:16,border:'1px solid #333'}}>
        <div style={{fontSize:12,color:'#888',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>📋 RECENT LEADS</span>
          <button onClick={() => setShowLeadModal(true)} style={{background:'#10b981',border:'none',borderRadius:4,padding:'4px 12px',color:'#fff',fontSize:11,cursor:'pointer'}}>+ Add Lead</button>
        </div>
        {leads.length === 0 ? (
          <div style={{color:'#666',fontSize:12,padding:20,textAlign:'center'}}>No leads yet. Add your first lead!</div>
        ) : (
          <div style={{display:'grid',gap:8}}>
            {leads.slice(0,5).map(lead => (
              <div key={lead.id} style={{background:'#0a0a15',padding:12,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13,color:'#fff'}}>{lead.name}</div>
                  <div style={{fontSize:11,color:'#666'}}>{lead.email} {lead.company && `• ${lead.company}`}</div>
                </div>
                <span style={{fontSize:9,background:lead.status==='converted'?'#10b981':lead.status==='qualified'?'#3b82f6':'#666',padding:'2px 8px',borderRadius:4}}>{lead.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Modal */}
      {showLeadModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#1a1a2e',borderRadius:16,padding:24,width:400}}>
            <h3 style={{margin:'0 0 16px',fontSize:18}}>Add New Lead</h3>
            <input placeholder="Name" value={leadForm.name} onChange={e=>setLeadForm({...leadForm,name:e.target.value})} style={{width:'100%',padding:12,background:'#0a0a15',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12}} />
            <input placeholder="Email" value={leadForm.email} onChange={e=>setLeadForm({...leadForm,email:e.target.value})} style={{width:'100%',padding:12,background:'#0a0a15',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12}} />
            <input placeholder="Company" value={leadForm.company} onChange={e=>setLeadForm({...leadForm,company:e.target.value})} style={{width:'100%',padding:12,background:'#0a0a15',border:'1px solid #333',borderRadius:8,color:'#fff',marginBottom:12}} />
            <div style={{display:'flex',gap:8}}>
              <button onClick={addLead} style={{flex:1,padding:12,background:'#10b981',border:'none',borderRadius:8,color:'#fff',fontWeight:600,cursor:'pointer'}}>Add Lead</button>
              <button onClick={()=>setShowLeadModal(false)} style={{flex:1,padding:12,background:'#333',border:'none',borderRadius:8,color:'#fff',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
