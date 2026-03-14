'use client';

import { useState, useEffect, useMemo } from 'react';

export default function KnowledgePage() {
  const [memories, setMemories] = useState([]);
  const [docs, setDocs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const [memRes, docRes, agentRes] = await Promise.all([
      fetch('/api/memories'),
      fetch('/api/docs'),
      fetch('/api/agents')
    ]);
    
    const memData = await memRes.json();
    const docData = await docRes.json();
    const agentData = await agentRes.json();
    
    setMemories(memData.memories || []);
    setDocs(docData.docs || []);
    setAgents(agentData.agents || []);
    setLoading(false);
  }

  // Filter items based on search and tab
  const filteredItems = useMemo(() => {
    let items = [];
    
    if (activeTab === 'all' || activeTab === 'memories') {
      const memItems = memories.map(m => ({
        type: 'memory',
        id: m.id,
        title: m.title || 'Untitled Memory',
        content: m.content,
        date: m.memory_date || m.created_at,
        agentId: m.agent_id,
        metadata: m
      }));
      items = [...items, ...memItems];
    }
    
    if (activeTab === 'all' || activeTab === 'docs') {
      const docItems = docs.map(d => ({
        type: 'doc',
        id: d.id,
        title: d.title,
        content: d.content,
        date: d.created_at,
        category: d.category,
        format: d.format,
        metadata: d
      }));
      items = [...items, ...docItems];
    }
    
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(s)) ||
        (i.content && i.content.toLowerCase().includes(s))
      );
    }
    
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [memories, docs, search, activeTab]);

  function getTypeBadge(item) {
    if (item.type === 'memory') {
      const mem = item.metadata;
      const type = mem.memory_type || 'conversation';
      const colors = {
        conversation: '#3b82f6',
        longterm: '#10b981',
        note: '#f59e0b',
        insight: '#8b5cf6'
      };
      return { label: '💭 Memory', color: colors[type] || colors.conversation };
    } else {
      const colors = {
        newsletter: '#8b5cf6',
        script: '#06b6d4',
        plan: '#f59e0b',
        research: '#10b981',
        report: '#3b82f6',
        general: '#888'
      };
      return { label: '📄 Doc', color: colors[item.category] || colors.general };
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  }

  function stripMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim();
  }

  async function deleteItem(item) {
    const confirmMsg = item.type === 'memory' ? 'Delete this memory?' : 'Delete this document?';
    if (!confirm(confirmMsg)) return;
    
    const endpoint = item.type === 'memory' ? `/api/memories?id=${item.id}` : `/api/docs?id=${item.id}`;
    await fetch(endpoint, { method: 'DELETE' });
    setSelectedItem(null);
    fetchData();
  }

  if (loading) {
    return <div className="loading">Loading knowledge base...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>🧠 Knowledge Base</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Memories and documents - all in one place
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search memories and documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        {[
          { id: 'all', label: '📚 All' },
          { id: 'memories', label: '💭 Memories' },
          { id: 'docs', label: '📄 Documents' }
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
        
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto', padding: '8px 16px' }}
        >
          + Add New
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{memories.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Memories</div>
        </div>
        <div className="card" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{docs.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Documents</div>
        </div>
        <div className="card" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{filteredItems.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Showing</div>
        </div>
      </div>

      {/* Items List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredItems.map(item => {
          const badge = getTypeBadge(item);
          const preview = stripMarkdown(item.content || '').slice(0, 120);
          
          return (
            <div 
              key={`${item.type}-${item.id}`}
              className="card"
              style={{ 
                padding: 16, 
                cursor: 'pointer',
                borderLeft: `3px solid ${badge.color}`
              }}
              onClick={() => setSelectedItem(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {formatDate(item.date)}
                    {item.type === 'doc' && item.category && (
                      <span style={{ marginLeft: 8, color: badge.color }}>• {item.category}</span>
                    )}
                  </div>
                </div>
                <span style={{
                  background: `${badge.color}20`,
                  color: badge.color,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500
                }}>
                  {badge.label}
                </span>
              </div>
              
              {preview && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {preview}...
                </div>
              )}
            </div>
          );
        })}
        
        {filteredItems.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div>No items found. Add your first memory or document!</div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '80vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedItem.title}</h2>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <span style={{
                background: `${getTypeBadge(selectedItem).color}20`,
                color: getTypeBadge(selectedItem).color,
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12
              }}>
                {getTypeBadge(selectedItem).label}
              </span>
              <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                {formatDate(selectedItem.date)}
              </span>
            </div>
            
            <div style={{ 
              background: 'var(--bg-tertiary)', 
              padding: 16, 
              borderRadius: 8, 
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              lineHeight: 1.6,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              {selectedItem.content || 'No content'}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn" 
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={() => deleteItem(selectedItem)}
              >
                Delete
              </button>
              <button className="btn" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddModal 
          agents={agents} 
          onClose={() => setShowAddModal(false)} 
          onCreated={() => {
            setShowAddModal(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}

function AddModal({ agents, onClose, onCreated }) {
  const [itemType, setItemType] = useState('memory');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    memory_type: 'note',
    category: 'general',
    agent_id: ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = itemType === 'memory' ? '/api/memories' : '/api/docs';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) onCreated();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add New</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Type Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setItemType('memory')}
            style={{
              flex: 1,
              padding: 12,
              border: `2px solid ${itemType === 'memory' ? '#3b82f6' : 'var(--border-color)'}`,
              background: itemType === 'memory' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
              borderRadius: 8,
              cursor: 'pointer',
              color: itemType === 'memory' ? '#3b82f6' : 'var(--text-secondary)'
            }}
          >
            💭 Memory
          </button>
          <button
            type="button"
            onClick={() => setItemType('doc')}
            style={{
              flex: 1,
              padding: 12,
              border: `2px solid ${itemType === 'doc' ? '#10b981' : 'var(--border-color)'}`,
              background: itemType === 'doc' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
              borderRadius: 8,
              cursor: 'pointer',
              color: itemType === 'doc' ? '#10b981' : 'var(--text-secondary)'
            }}
          >
            📄 Document
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              rows={6}
              required
            />
          </div>

          {itemType === 'memory' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.memory_type}
                  onChange={e => setForm({...form, memory_type: e.target.value})}
                >
                  <option value="conversation">Conversation</option>
                  <option value="note">Note</option>
                  <option value="insight">Insight</option>
                  <option value="longterm">Long-term</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Agent</label>
                <select
                  className="form-select"
                  value={form.agent_id}
                  onChange={e => setForm({...form, agent_id: e.target.value})}
                >
                  <option value="">None</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="newsletter">Newsletter</option>
                <option value="script">Script</option>
                <option value="plan">Plan</option>
                <option value="research">Research</option>
                <option value="report">Report</option>
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
