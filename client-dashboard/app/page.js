'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [client, setClient] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pipeline');

  useEffect(() => {
    const savedClient = localStorage.getItem('pp_client');
    if (savedClient) setClient(JSON.parse(savedClient));
  }, []);

  useEffect(() => {
    if (client) {
      fetchLeads();
      fetchReports();
    }
  }, [client]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://72.62.231.18:3004/api/leads?clientId=' + client.id);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('http://72.62.231.18:3004/api/reports?clientId=' + client.id);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://72.62.231.18:3004/api/clients');
      const data = await res.json();
      const foundClient = data.clients?.find(c => c.email === email);
      if (foundClient) {
        setClient(foundClient);
        localStorage.setItem('pp_client', JSON.stringify(foundClient));
      } else {
        alert('Client not found');
      }
    } catch (err) { alert('Login failed'); }
    setLoading(false);
  };

  const getLeadsByStatus = (status) => leads.filter(l => l.status === status);
  const stats = { total: leads.length, new: getLeadsByStatus('new').length, contacted: getLeadsByStatus('contacted').length, replied: getLeadsByStatus('replied').length, meetings: getLeadsByStatus('meeting_booked').length };

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><span style={{ color: '#10b981' }}>PP</span>Ventures</h1>
          <p style={{ color: '#888', marginBottom: '2rem' }}>Client Dashboard</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '1rem', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#10b981', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '1rem 2rem', background: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem' }}><span style={{ color: '#10b981' }}>PP</span>Ventures | {client.business_name}</div>
        <button onClick={() => { setClient(null); localStorage.removeItem('pp_client'); }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </header>

      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', borderBottom: '1px solid #222' }}>
        {[{ label: 'Total Leads', value: stats.total }, { label: 'New', value: stats.new, color: '#3b82f6' }, { label: 'Contacted', value: stats.contacted, color: '#f59e0b' }, { label: 'Replied', value: stats.replied, color: '#10b981' }, { label: 'Meetings', value: stats.meetings, color: '#8b5cf6' }].map((s, i) => <div key={i} style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color || '#fff' }}>{s.value}</div><div style={{ color: '#666', fontSize: '0.9rem' }}>{s.label}</div></div>)}
      </div>

      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #222', display: 'flex', gap: '2rem' }}>
        {['pipeline', 'automations', 'reports'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', color: activeTab === tab ? '#10b981' : '#666', fontSize: '1rem', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === tab ? '2px solid #10b981' : '2px solid transparent' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'pipeline' && (
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {[{ status: 'new', label: 'New', color: '#3b82f6' }, { status: 'contacted', label: 'Contacted', color: '#f59e0b' }, { status: 'replied', label: 'Replied', color: '#10b981' }, { status: 'meeting_booked', label: 'Meeting', color: '#8b5cf6' }, { status: 'closed', label: 'Closed', color: '#22c55e' }].map(c => (
            <div key={c.status} style={{ background: '#111', padding: '1rem', borderRadius: '12px', minHeight: '200px' }}>
              <h3 style={{ color: c.color, marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>{c.label} ({getLeadsByStatus(c.status).length})</h3>
              {getLeadsByStatus(c.status).map(l => <div key={l.id} style={{ background: '#0a0a0a', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem' }}><div style={{ fontWeight: '600' }}>{l.name}</div><div style={{ color: '#666', fontSize: '0.85rem' }}>{l.company}</div></div>)}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'automations' && (
        <div style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Active Automations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { name: 'Lead Scraping', desc: 'Finds leads in your niche daily', schedule: '9:00 AM', tier: 'all' },
              { name: 'Industry News', desc: 'Daily news relevant to your business', schedule: '8:00 AM', tier: 'starter' },
              { name: 'Competitor Monitoring', desc: 'Tracks competitor website changes', schedule: '10:00 AM', tier: 'growth' },
              { name: 'Website Audit', desc: 'Weekly site health check', schedule: 'Monday 9:00 AM', tier: 'growth' },
              { name: 'Custom Workflows', desc: 'Your custom automation tasks', schedule: 'On demand', tier: 'enterprise' }
            ].filter(a => client.tier === 'enterprise' || client.tier === 'growth' || a.tier === 'all' || (client.tier === 'starter' && a.tier === 'starter')).map((auto, i) => (
              <div key={i} style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#10b981' }}>{auto.name}</h4>
                  <span style={{ background: '#222', color: '#888', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>{auto.schedule}</span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>{auto.desc}</p>
                <button style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>Run Now</button>
              </div>
            ))}
          </div>
          
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Recent Automation Runs</h3>
          <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#222', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Automation</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Run Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Lead Scraping', status: 'success', duration: '45s', time: 'Today 9:00 AM' },
                  { name: 'Industry News', status: 'success', duration: '12s', time: 'Today 8:00 AM' },
                  { name: 'Competitor Monitoring', status: 'failed', duration: '30s', time: 'Yesterday 10:00 AM' }
                ].map((run, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '1rem' }}>{run.name}</td>
                    <td style={{ padding: '1rem' }}><span style={{ color: run.status === 'success' ? '#10b981' : '#ef4444' }}>{run.status}</span></td>
                    <td style={{ padding: '1rem', color: '#666' }}>{run.duration}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{run.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ padding: '2rem' }}>
          {reports.length === 0 ? <p style={{ color: '#666' }}>No reports yet. Reports generated daily at 6pm.</p> : reports.map(r => <div key={r.id} style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}><div style={{ color: '#10b981' }}>{new Date(r.report_date).toLocaleDateString()}</div><p>{r.summary}</p></div>)}
        </div>
      )}
    </div>
  );
}
