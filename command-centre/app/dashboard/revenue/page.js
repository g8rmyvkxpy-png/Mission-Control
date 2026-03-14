'use client';

import { useState, useEffect } from 'react';

export default function RevenuePage() {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [summaryRes, entriesRes, pipelineRes, milestonesRes, clientsRes] = await Promise.all([
        fetch('/api/revenue?type=summary'),
        fetch('/api/revenue?type=entries'),
        fetch('/api/revenue?type=pipeline'),
        fetch('/api/revenue?type=milestones'),
        fetch('http://72.62.231.18:3004/api/clients').catch(() => ({ json: () => ({ clients: [] }) }))
      ]);
      
      const summaryData = await summaryRes.json();
      const entriesData = await entriesRes.json();
      const pipelineData = await pipelineRes.json();
      const milestonesData = await milestonesRes.json();
      const clientsData = await clientsRes.json();
      
      setSummary(summaryData.summary);
      setEntries(entriesData.entries || []);
      setPipeline(pipelineData.pipeline || []);
      setMilestones(milestonesData.milestones || []);
      setClients(clientsData.clients || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  }

  const stageColors = {
    lead: '#6b7280',
    qualified: '#3b82f6',
    proposal: '#f59e0b',
    negotiation: '#8b5cf6',
    closed_won: '#10b981',
    closed_lost: '#ef4444'
  };

  const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  // Calculate client stats
  const totalMRR = clients.reduce((sum, c) => sum + (Number(c.mrr) || 0), 0);
  const activeClients = clients.filter(c => c.status === 'active' || c.status === 'trial').length;
  const trials = clients.filter(c => c.status === 'trial').length;

  if (loading) {
    return <div className="loading">Loading business data...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>💰 Business Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Revenue, pipeline, and clients - all in one place
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>${summary?.totalRevenue?.toLocaleString() || 0}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>MRR</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>${summary?.mrr?.toLocaleString() || 0}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Pipeline</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>${summary?.pipelineValue?.toLocaleString() || 0}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Clients</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>{clients.length}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Active</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{activeClients}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Trials</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{trials}</div>
        </div>
      </div>

      {/* Progress to $1M */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Progress to $1M</span>
          <span>{summary?.progress || 0}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.min(summary?.progress || 0, 100)}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #10b981, #3b82f6)',
            borderRadius: 4
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'revenue', label: '💵 Revenue' },
          { id: 'pipeline', label: '📈 Pipeline' },
          { id: 'clients', label: '👥 Clients' },
          { id: 'milestones', label: '🎯 Milestones' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Revenue */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Recent Revenue</div>
            {entries.slice(0, 5).map(entry => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: 13 }}>{entry.customer_name || entry.source}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.received_date}</div>
                </div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>${Number(entry.amount).toLocaleString()}</div>
              </div>
            ))}
            {entries.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No revenue yet</div>}
          </div>

          {/* Active Deals */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Active Deals</div>
            {pipeline.filter(p => !['closed_won', 'closed_lost'].includes(p.stage)).slice(0, 5).map(deal => (
              <div key={deal.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: 13 }}>{deal.company_name}</div>
                  <div style={{ fontSize: 11, color: stageColors[deal.stage] }}>{deal.stage}</div>
                </div>
                <div style={{ fontWeight: 600 }}>${Number(deal.value || 0).toLocaleString()}</div>
              </div>
            ))}
            {pipeline.filter(p => !['closed_won', 'closed_lost'].includes(p.stage)).length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No active deals</div>
            )}
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Revenue Entries</h2>
            <button className="btn btn-primary" onClick={() => setShowEntryModal(true)}>
              + Add Entry
            </button>
          </div>
          
          {entries.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No revenue entries yet. Add your first!
            </div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Source</th>
                    <th style={{ textAlign: 'right', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ textAlign: 'center', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Recurring</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 12, fontSize: 13 }}>{entry.received_date}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{entry.customer_name || '-'}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{entry.source}</td>
                      <td style={{ padding: 12, fontSize: 13, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                        ${Number(entry.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: 12, fontSize: 13, textAlign: 'center' }}>
                        {entry.recurring ? '🔄' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Sales Pipeline</h2>
            <button className="btn btn-primary" onClick={() => setShowPipelineModal(true)}>
              + Add Deal
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
            {stageOrder.filter(s => s !== 'closed_won' && s !== 'closed_lost').map(stage => {
              const stageDeals = pipeline.filter(p => p.stage === stage);
              const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
              
              return (
                <div key={stage} style={{ 
                  minWidth: 200, 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 8,
                  padding: 12
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: `2px solid ${stageColors[stage]}`
                  }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{stage}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>${stageValue.toLocaleString()}</span>
                  </div>
                  
                  {stageDeals.map(deal => (
                    <div 
                      key={deal.id} 
                      className="card"
                      style={{ 
                        padding: 10, 
                        marginBottom: 6,
                        borderLeft: `3px solid ${stageColors[stage]}`
                      }}
                    >
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{deal.company_name}</div>
                      <div style={{ fontSize: 12, color: '#10b981' }}>${Number(deal.value || 0).toLocaleString()}</div>
                    </div>
                  ))}
                  
                  {stageDeals.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', padding: 12 }}>
                      No deals
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Clients ({clients.length})</h2>
          </div>
          
          {clients.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>👥</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No clients yet</div>
              Clients from the clients API will appear here.
            </div>
          ) : (
            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Client</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Niche</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Tier</th>
                    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 500 }}>{client.business_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{client.email}</div>
                      </td>
                      <td style={{ padding: 12, fontSize: 13 }}>{client.niche || '-'}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          background: client.tier === 'enterprise' ? '#3b82f6' : client.tier === 'growth' ? '#10b981' : '#666',
                          color: '#000',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {client.tier}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: 13, color: client.status === 'trial' ? '#f59e0b' : '#10b981' }}>
                        {client.status}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                        ${client.mrr || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Revenue Milestones</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {milestones.map(milestone => (
              <div 
                key={milestone.id} 
                className="card"
                style={{ 
                  padding: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16,
                  border: milestone.reached ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: milestone.reached ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)'
                }}
              >
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: milestone.reached ? '#10b981' : 'var(--bg-tertiary)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 16
                }}>
                  {milestone.reached ? '✓' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{milestone.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Target: ${milestone.target_amount?.toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: milestone.reached ? '#10b981' : 'var(--text-secondary)' }}>
                  ${milestone.current_amount?.toLocaleString() || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && (
        <EntryModal onClose={() => setShowEntryModal(false)} onCreated={() => {
          setShowEntryModal(false);
          fetchData();
        }} />
      )}

      {/* Pipeline Modal */}
      {showPipelineModal && (
        <PipelineModal onClose={() => setShowPipelineModal(false)} onCreated={() => {
          setShowPipelineModal(false);
          fetchData();
        }} />
      )}
    </div>
  );
}

function EntryModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    source: 'subscription',
    customer_name: '',
    customer_email: '',
    status: 'confirmed',
    recurring: false,
    frequency: 'monthly',
    received_date: new Date().toISOString().split('T')[0]
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'entry', ...form })
      });
      
      if (res.ok) onCreated();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: 380, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Add Revenue Entry</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Amount *</label>
            <input type="number" className="form-input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required step="0.01" />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Source</label>
            <select className="form-select" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
              <option value="subscription">Subscription</option>
              <option value="one_time">One-time</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Customer Name</label>
            <input type="text" className="form-input" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.recurring} onChange={e => setForm({...form, recurring: e.target.checked})} />
              Recurring Revenue
            </label>
          </div>
          
          {form.recurring && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Frequency</label>
              <select className="form-select" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PipelineModal({ onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    stage: 'lead',
    value: '',
    probability: 10
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pipeline', ...form })
      });
      
      if (res.ok) onCreated();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: 380, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Add Pipeline Deal</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Company Name *</label>
            <input type="text" className="form-input" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Stage</label>
              <select className="form-select" value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Value ($)</label>
              <input type="number" className="form-input" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
            </div>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Probability (%)</label>
            <input type="number" className="form-input" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} min="0" max="100" />
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : 'Add Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
