'use client';

import { useState, useEffect } from 'react';

interface Integration {
  id: string;
  provider: string;
  name: string;
  is_active: boolean;
}

export default function IntegrationsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newInt, setNewInt] = useState({ provider: 'slack', name: '', webhook_url: '' });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org_id') || localStorage.getItem('mc_org_id');
    if (org) {
      setOrgId(org);
      fetchIntegrations(org);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchIntegrations = async (orgId: string) => {
    try {
      const res = await fetch(`/api/integrations?org_id=${orgId}`);
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const addIntegration = async () => {
    if (!orgId || !newInt.name || !newInt.webhook_url) return;
    
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          provider: newInt.provider,
          name: newInt.name,
          credentials: { webhook_url: newInt.webhook_url }
        })
      });
      
      if (res.ok) {
        fetchIntegrations(orgId);
        setShowModal(false);
        setNewInt({ provider: 'slack', name: '', webhook_url: '' });
      }
    } catch (err) {
      console.error('Failed to add:', err);
    }
  };

  const removeIntegration = async (id: string) => {
    if (!orgId) return;
    
    try {
      await fetch(`/api/integrations?id=${id}&org_id=${orgId}`, { method: 'DELETE' });
      fetchIntegrations(orgId);
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  if (!orgId) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No Organization Selected</div>;
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  const providerLogos: Record<string, string> = {
    slack: '💬',
    zapier: '⚡',
    webhook: '🔗',
    email: '📧',
    discord: '🎮'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>🔌 Integrations</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 24px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
        >
          + Add Integration
        </button>
      </div>

      {integrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
          <h3>No integrations yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Connect your favorite tools</p>
          <button onClick={() => setShowModal(true)} style={{ padding: '12px 24px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
            Add Integration
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {integrations.map(int => (
            <div key={int.id} style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '24px' }}>{providerLogos[int.provider] || '🔗'}</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{int.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{int.provider}</div>
                </div>
              </div>
              <button onClick={() => removeIntegration(int.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', width: '400px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px' }}>Add Integration</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa' }}>Provider</label>
              <select value={newInt.provider} onChange={e => setNewInt({ ...newInt, provider: e.target.value })} style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}>
                <option value="slack">Slack</option>
                <option value="zapier">Zapier</option>
                <option value="webhook">Custom Webhook</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa' }}>Name</label>
              <input type="text" value={newInt.name} onChange={e => setNewInt({ ...newInt, name: e.target.value })} placeholder="My Slack Integration" style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa' }}>Webhook URL</label>
              <input type="text" value={newInt.webhook_url} onChange={e => setNewInt({ ...newInt, webhook_url: e.target.value })} placeholder="https://hooks.slack.com/..." style={{ width: '100%', padding: '12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #27272a', borderRadius: '8px', color: '#a1a1aa', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addIntegration} style={{ padding: '12px 24px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
