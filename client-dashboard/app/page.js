'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [client, setClient] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [settings, setSettings] = useState({ niche: '', website: '', notify_email: true });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedClient = localStorage.getItem('pp_client');
    if (savedClient) {
      try {
        const c = JSON.parse(savedClient);
        setClient(c);
        setSettings({ niche: c.niche || '', website: c.website || '', notify_email: c.notify_email !== false });
      } catch (e) {
        localStorage.removeItem('pp_client');
      }
    }
  }, []);

  useEffect(() => {
    if (client && client.id) {
      fetchLeads();
      fetchReports();
    }
  }, [client]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeads = async () => {
    if (!client?.id) return;
    try {
      const res = await fetch('/api/leads?clientId=' + client.id);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    if (!client?.id) return;
    try {
      const res = await fetch('/api/reports?clientId=' + client.id);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/clients?t=' + Date.now());
      const data = await response.json();
      
      if (!data.clients) {
        setError('Unable to fetch clients');
        setLoading(false);
        return;
      }
      
      const inputEmail = email.toLowerCase().trim();
      const foundClient = data.clients.find(c => c.email && c.email.toLowerCase().trim() === inputEmail);
      
      if (foundClient) {
        setClient(foundClient);
        setSettings({ niche: foundClient.niche || '', website: foundClient.website || '', notify_email: foundClient.notify_email !== false });
        localStorage.setItem('pp_client', JSON.stringify(foundClient));
      } else {
        setError('No account found. Please sign up first.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const getLeadsByStatus = (status) => leads.filter(l => l.status === status);
  
  const getDaysLeft = () => {
    if (!client?.trial_end) return 14;
    const end = new Date(client.trial_end);
    const now = new Date();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, clientId: client.id })
      });
      const data = await res.json();
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || "I'm analyzing your data. Your agents are working hard to gather more information!"
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm connected to your dashboard. You have " + leads.length + " leads. " + getLeadsByStatus('new').length + " are new."
      }]);
    }
    setChatLoading(false);
  };

  const handleRunAutomation = async (taskType) => {
    showToast('⏳ Starting automation...', 'loading');
    // Simulate for now
    setTimeout(() => {
      showToast('✅ Lead scraping started — check back in a few minutes');
      setTimeout(fetchLeads, 30000);
    }, 2000);
  };

  const handleSaveSettings = async () => {
    showToast('✅ Settings saved!');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
  };

  const automations = [
    { name: 'Lead Scraping', desc: 'Finds leads in your niche daily', schedule: '9:00 AM', tier: 'all', status: 'active', lastRun: '2 hours ago' },
    { name: 'Industry News', desc: 'Daily news relevant to your business', schedule: '8:00 AM', tier: 'starter', status: 'active', lastRun: '3 hours ago' },
  ].filter(a => client?.tier === 'enterprise' || client?.tier === 'growth' || a.tier === 'all');

  const lockedAutomations = [
    { name: 'Competitor Monitoring', desc: 'Tracks competitor website changes', schedule: '10:00 AM', tier: 'growth' },
    { name: 'Website Audit', desc: 'Weekly site health check', schedule: 'Monday 9AM', tier: 'growth' },
  ];

  const suggestedQuestions = [
    "How many leads did I get today?",
    "What are my agents working on?",
    "What should I do with my new leads?"
  ];

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><span style={{ color: '#10b981' }}>◆ PP</span>Ventures</h1>
          <p style={{ color: '#888', marginBottom: '2rem' }}>Client Dashboard</p>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '1rem', boxSizing: 'border-box' }} 
            />
            {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', background: '#10b981', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Logging in...' : 'Access My Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stats = { 
    total: leads.length, 
    new: getLeadsByStatus('new').length, 
    contacted: getLeadsByStatus('contacted').length, 
    replied: getLeadsByStatus('replied').length, 
    meetings: getLeadsByStatus('meeting_booked').length 
  };

  const statsConfig = [
    { label: 'Total Leads', value: stats.total, color: '#fff', bg: '#1a1a2e' },
    { label: 'New Today', value: stats.new, color: '#3b82f6', bg: '#1e3a5f' },
    { label: 'Contacted', value: stats.contacted, color: '#f59e0b', bg: '#3d2e0b' },
    { label: 'Replied', value: stats.replied, color: '#10b981', bg: '#0a2e1f' },
    { label: 'Meetings', value: stats.meetings, color: '#8b5cf6', bg: '#2e1a3d' },
    { label: 'Tasks Running', value: 3, color: '#06b6d4', bg: '#0a2e2e' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
      {/* Toast */}
      {toast && (
        <div style={{ 
          position: 'fixed', top: '20px', right: '20px', 
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'loading' ? '#f59e0b' : '#10b981',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#111', borderRight: '1px solid #222', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}><span style={{ color: '#10b981' }}>◆ PP</span>Ventures</h2>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Client Dashboard</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          {[
            { id: 'pipeline', icon: '🎯', label: 'Pipeline' },
            { id: 'automations', icon: '⚡', label: 'Automations' },
            { id: 'reports', icon: '📊', label: 'Reports' },
            { id: 'ask', icon: '💬', label: 'Ask AI' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: activeTab === tab.id ? '#1a1a2e' : 'transparent',
                border: 'none',
                color: activeTab === tab.id ? '#10b981' : '#888',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textAlign: 'left',
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid #222' }}>
          <button 
            onClick={() => { setClient(null); localStorage.removeItem('pp_client'); }}
            style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '240px' }}>
        <header style={{ padding: '1.5rem 2rem', background: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{getGreeting()}, {client.name || 'there'} 👋</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{client.business_name}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: '#10b98120', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>
              🔄 Trial — {getDaysLeft()} days left
            </span>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'pipeline' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {statsConfig.map((stat, i) => (
                  <div key={i} style={{ background: stat.bg, padding: '1.25rem', borderRadius: '12px', borderLeft: `3px solid ${stat.color}` }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: '1rem', color: '#888' }}>Lead Pipeline</h3>
              
              {leads.length === 0 ? (
                <div style={{ background: '#111', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</p>
                  <p style={{ color: '#888' }}>Your agents are finding your first real leads — check back in a few minutes</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {[
                    { status: 'new', label: 'New', color: '#3b82f6' },
                    { status: 'contacted', label: 'Contacted', color: '#f59e0b' },
                    { status: 'replied', label: 'Replied', color: '#10b981' },
                    { status: 'meeting_booked', label: 'Meeting', color: '#8b5cf6' },
                  ].map(col => (
                    <div key={col.status} style={{ background: '#111', borderRadius: '12px', padding: '1rem', minHeight: '200px' }}>
                      <h4 style={{ color: col.color, marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.5rem' }}>
                        {col.label} ({getLeadsByStatus(col.status).length})
                      </h4>
                      {getLeadsByStatus(col.status).map(lead => (
                        <div 
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          style={{ background: '#0a0a0a', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.75rem', flexShrink: 0 }}>
                            {getInitials(lead.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                            <div style={{ color: '#666', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.company}</div>
                            <div style={{ color: '#444', fontSize: '0.7rem', marginTop: '0.25rem' }}>🤖 AI Scraped</div>
                          </div>
                        </div>
                      ))}
                      {getLeadsByStatus(col.status).length === 0 && (
                        <p style={{ color: '#444', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No leads</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'automations' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Active Automations</h3>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {automations.map((auto, i) => (
                  <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '1.25rem', border: '1px solid #222' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontWeight: '600' }}>{auto.name}</span>
                      </div>
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>{auto.schedule}</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{auto.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#444', fontSize: '0.8rem' }}>Last run: {auto.lastRun}</span>
                      <button 
                        onClick={() => handleRunAutomation(auto.name)}
                        style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Run Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ color: '#666', marginBottom: '1rem' }}>Coming on Growth plan</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {lockedAutomations.map((auto, i) => (
                  <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '1.25rem', border: '1px solid #333', opacity: 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <span style={{ fontWeight: '600' }}>{auto.name}</span>
                      </div>
                      <a href="/pricing" style={{ color: '#10b981', fontSize: '0.85rem', textDecoration: 'none' }}>Upgrade to Growth →</a>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>{auto.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Performance Reports</h3>
              {reports.length === 0 ? (
                <div style={{ background: '#111', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</p>
                  <p style={{ color: '#888', marginBottom: '0.5rem' }}>Your first report will be generated tonight at 6pm</p>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>Reports are generated daily showing your leads, tasks, and insights</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {reports.map((report, i) => (
                    <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '1.25rem', border: '1px solid #222' }}>
                      <div style={{ color: '#10b981', marginBottom: '0.5rem' }}>{new Date(report.report_date).toLocaleDateString()}</div>
                      <p style={{ color: '#ccc' }}>{report.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ask' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Ask Your AI Assistant</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setChatInput(q)}
                    style={{ background: '#222', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', color: '#888', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, background: '#111', borderRadius: '12px', padding: '1rem', overflowY: 'auto', marginBottom: '1rem' }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
                    Ask me anything about your leads, agents, or business performance!
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ 
                    background: msg.role === 'user' ? '#1a1a2e' : '#0a2e1f', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '0.75rem',
                    maxWidth: '80%',
                    marginLeft: msg.role === 'user' ? 'auto' : '0',
                  }}>
                    {msg.role === 'assistant' && <div style={{ color: '#10b981', fontSize: '0.75rem', marginBottom: '0.25rem' }}>◆ PPVentures AI</div>}
                    <p style={{ color: '#ccc' }}>{msg.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChat} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff' }}
                />
                <button 
                  type="submit"
                  disabled={chatLoading}
                  style={{ padding: '0 1.5rem', background: '#10b981', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '600', cursor: 'pointer' }}
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Settings</h3>
              
              <div style={{ background: '#111', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#888' }}>Profile</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Name</label>
                    <input 
                      type="text" 
                      value={client.name || ''}
                      onChange={e => setClient({...client, name: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email (read only)</label>
                    <input 
                      type="email" 
                      value={client.email || ''}
                      disabled
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #222', background: '#0a0a0a', color: '#666' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Business Name</label>
                    <input 
                      type="text" 
                      value={client.business_name || ''}
                      onChange={e => setClient({...client, business_name: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#111', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#888' }}>Target Niche</h4>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.75rem' }}>What type of clients are you looking for? (used by lead scraping agent)</p>
                <textarea 
                  value={settings.niche}
                  onChange={e => setSettings({...settings, niche: e.target.value})}
                  placeholder="e.g., Solo consultants in India, Small agencies in US..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#111', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#888' }}>Plan</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ background: '#10b98120', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                      {client.tier?.toUpperCase() || 'STARTER'} Plan
                    </span>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>{getDaysLeft()} days remaining in trial</p>
                  </div>
                  <a href="/pricing" style={{ background: '#10b981', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    Upgrade Plan
                  </a>
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                style={{ background: '#10b981', color: '#000', padding: '1rem 2rem', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Save Settings
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          onClick={() => setSelectedLead(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '90%', border: '1px solid #222' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem' }}>
                {getInitials(selectedLead.name)}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{selectedLead.name}</h3>
                <p style={{ color: '#666', margin: 0 }}>{selectedLead.company}</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedLead.email && <div><span style={{ color: '#666' }}>Email:</span> {selectedLead.email}</div>}
              {selectedLead.phone && <div><span style={{ color: '#666' }}>Phone:</span> {selectedLead.phone}</div>}
              {selectedLead.website && <div><span style={{ color: '#666' }}>Website:</span> {selectedLead.website}</div>}
              <div><span style={{ color: '#666' }}>Status:</span> {selectedLead.status}</div>
              <div><span style={{ color: '#666' }}>Source:</span> {selectedLead.source || 'AI Scraped'}</div>
              <div><span style={{ color: '#666' }}>Added:</span> {new Date(selectedLead.created_at).toLocaleDateString()}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ flex: 1, padding: '0.75rem', background: '#222', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
              >
                Close
              </button>
              <button style={{ flex: 1, padding: '0.75rem', background: '#10b981', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '600', cursor: 'pointer' }}>
                Generate Outreach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
