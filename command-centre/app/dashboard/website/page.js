'use client';

import { useState, useEffect } from 'react';

export default function WebsitePage() {
  const [data, setData] = useState({
    enhancements: [],
    stats: { total: 0, queued: 0, implemented: 0, by_page: {} }
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/website/enhancements');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSynced(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleScanNow() {
    alert('Scan triggered! It will run on the next 30-minute cycle.');
  }

  async function handleImplementNow() {
    const queued = data.enhancements.find(e => e.status === 'queued');
    if (!queued) {
      alert('No queued enhancements to implement');
      return;
    }
    try {
      await fetch(`/api/website/enhancements/${queued.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      });
      fetchData();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  const enhancements = data?.enhancements || [];
  const stats = data?.stats || { total: 0, queued: 0, implemented: 0, by_page: {} };
  const filtered = filter === 'all' ? enhancements : enhancements.filter(e => e.status === filter);

  const pages = ['homepage', 'automation_landing', 'automation_dashboard', 'services', 'about', 'ai_agents', 'blog', 'contact'];

  function getHealth(page) {
    const p = stats.by_page?.[page] || {};
    const totalForPage = (p.queued || 0) + (p.in_progress || 0) + (p.implemented || 0);
    const hasBeenScanned = totalForPage > 0;
    const score = hasBeenScanned ? Math.max(0, 10 - Math.floor((p.queued || 0) / 2)) : null;
    return { ...p, score, hasBeenScanned };
  }

  function timeAgo(date) {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px'
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  const queueCount = stats.queued + stats.in_progress;
  const implementedThisWeek = enhancements.filter(e => {
    if (e.status !== 'implemented' || !e.implemented_at) return false;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return new Date(e.implemented_at).getTime() > weekAgo;
  }).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            🌐 Website Monitor
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time website enhancement tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleScanNow}
            style={{ background: '#21262d', border: '1px solid #30363d',
              color: '#58a6ff', padding: '6px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px' }}>
            🔍 Scan Now
          </button>
          <button onClick={handleImplementNow}
            style={{ background: '#238636', border: 'none',
              color: '#fff', padding: '6px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px' }}>
            ⚡ Implement Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}>
            {implementedThisWeek}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>🔧 Implemented This Week</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#3b82f6', fontSize: '28px', fontWeight: 'bold' }}>
            {new Set(enhancements.map(e => e.page)).size}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>🔍 Pages Scanned</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 'bold' }}>{queueCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>⏳ Queue Size</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>
            {timeAgo(enhancements.find(e => e.implemented_at)?.implemented_at)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>⚡ Last Improvement</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        {/* Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'queued', 'in_progress', 'implemented', 'failed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    background: filter === f ? '#f97316' : 'var(--bg-tertiary)',
                    color: filter === f ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(e => (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                style={{
                  ...cardStyle,
                  borderLeft: e.status === 'implemented' ? '3px solid #10b981' :
                             e.status === 'in_progress' ? '3px solid #f97316' :
                             e.status === 'failed' ? '3px solid #ef4444' : '3px solid #6b7280',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    background: e.status === 'implemented' ? '#064e3b' :
                               e.status === 'in_progress' ? '#78350f' : 'var(--bg-tertiary)',
                    color: e.status === 'implemented' ? '#34d399' :
                           e.status === 'in_progress' ? '#fbbf24' : 'var(--text-secondary)'
                  }}>
                    {e.status === 'implemented' ? '✅ Implemented' :
                     e.status === 'in_progress' ? '🔧 In Progress' :
                     e.status === 'failed' ? '❌ Failed' : '⏳ Queued'}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: '#1e3a5f', color: '#60a5fa' }}>
                    {e.page}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: e.priority === 'high' ? '#7f1d1d' : 'var(--bg-tertiary)', color: e.priority === 'high' ? '#fca5a5' : 'var(--text-secondary)' }}>
                    {e.priority || 'medium'} priority
                  </span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}>{e.issue}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{e.improvement}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>by {e.agent_id ? 'Agent' : 'System'}</span>
                  <span>{timeAgo(e.created_at)}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                <div style={{ color: 'var(--text-secondary)' }}>No {filter} enhancements yet</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Scanner runs every 30 minutes
                </div>
              </div>
            )}
          </div>

          {/* Last synced indicator */}
          <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
            🔄 Auto-refreshes every 30s · Last synced: {lastSynced ? timeAgo(lastSynced) : 'Never'}
          </div>
        </div>

        {/* Health */}
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Page Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pages.map(page => {
              const h = getHealth(page);
              const color = h.score === null ? 'var(--text-muted)' : h.score >= 7 ? '#10b981' : h.score >= 4 ? '#f59e0b' : '#ef4444';
              const total = (h.implemented || 0) + (h.queued || 0) + (h.in_progress || 0);
              const progress = total > 0 ? ((h.implemented || 0) / total) * 100 : 100;
              return (
                <div key={page} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>{page.replace(/_/g, ' ')}</span>
                    <a href={`https://ppventures.tech/${page === 'homepage' ? '' : page === 'automation_landing' ? 'automation' : page}`} target="_blank" style={{ color: '#10b981', fontSize: '12px', textDecoration: 'none' }}>View →</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ color, fontSize: '24px', fontWeight: 'bold' }}>{h.hasBeenScanned ? `${h.score}/10` : '—'}</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: h.score === null ? 'var(--text-muted)' : h.score >= 7 ? '#10b981' : h.score >= 4 ? '#f59e0b' : '#ef4444', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    <span style={{ color: '#10b981' }}>{h.implemented || 0} fixed</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>{h.queued || 0} queued</span>
                    {h.in_progress > 0 && <span style={{ color: '#f59e0b', marginLeft: '12px' }}>{h.in_progress} in progress</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
              padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: '#1e3a5f', color: '#60a5fa' }}>{selected.page}</span>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{selected.status}</span>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: selected.priority === 'high' ? '#7f1d1d' : 'var(--bg-tertiary)', color: selected.priority === 'high' ? '#fca5a5' : 'var(--text-secondary)' }}>{selected.priority || 'medium'} priority</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{selected.issue}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{selected.improvement}</p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>File</div>
              <code style={{ color: '#10b981', fontSize: '12px' }}>{selected.file_path}</code>
            </div>
            {selected.status === 'queued' && (
              <button
                onClick={async () => {
                  await fetch(`/api/website/enhancements/${selected.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'in_progress' })
                  });
                  fetchData();
                  setSelected(null);
                }}
                style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ⚡ Mark as Implemented
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
