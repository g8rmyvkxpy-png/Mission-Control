'use client';

import { useState, useEffect } from 'react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://72.62.231.18:3004/api/clients');
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getLeadsForClient = async (clientId) => {
    try {
      const res = await fetch(`http://72.62.231.18:3004/api/leads?clientId=${clientId}`);
      const data = await res.json();
      return data.leads || [];
    } catch (e) {
      return [];
    }
  };

  const [leadsData, setLeadsData] = useState({});

  useEffect(() => {
    if (clients.length > 0) {
      Promise.all(clients.map(c => getLeadsForClient(c.id).then(leads => ({ id: c.id, leads }))))
        .then(results => {
          const leadsMap = {};
          results.forEach(r => leadsMap[r.id] = r.leads);
          setLeadsData(leadsMap);
        });
    }
  }, [clients]);

  const totalMRR = clients.reduce((sum, c) => sum + (c.mrr || 0), 0);
  const totalLeads = Object.values(leadsData).flat().length;

  if (loading) {
    return <div style={{ padding: '2rem', color: '#888' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Clients</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{clients.length}</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Monthly Recurring Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${totalMRR.toLocaleString()}</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Leads</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{totalLeads}</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Trials</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{clients.filter(c => c.status === 'trial').length}</div>
        </div>
      </div>

      {/* Clients Table */}
      <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #222' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>All Clients</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #222', color: '#888' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Niche</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Tier</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>MRR</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Leads</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{client.business_name}</div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>{client.email}</div>
                </td>
                <td style={{ padding: '1rem', color: '#ccc' }}>{client.niche || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    background: client.tier === 'enterprise' ? '#3b82f6' : client.tier === 'growth' ? '#10b981' : '#666',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {client.tier}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    color: client.status === 'trial' ? '#f59e0b' : '#10b981',
                    fontSize: '0.85rem'
                  }}>
                    {client.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981' }}>${client.mrr}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#3b82f6' }}>{leadsData[client.id]?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            No clients yet. Sign up via the landing page!
          </div>
        )}
      </div>
    </div>
  );
}
