'use client';

import { useState, useEffect, useMemo } from 'react';

export default function MemoryPage() {
  const [memories, setMemories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentFilter, setAgentFilter] = useState('');

  useEffect(() => {
    fetchMemories();
    fetchAgents();
    
    const interval = setInterval(fetchMemories, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMemories() {
    const res = await fetch(`/api/memories${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    const data = await res.json();
    setMemories(data.memories || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  // Group memories by date (with agent filter)
  const groupedMemories = useMemo(() => {
    const filtered = agentFilter 
      ? memories.filter(m => m.agent_id === agentFilter)
      : memories;
    const groups = {};
    filtered.forEach(m => {
      const date = m.memory_date || m.created_at?.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  }, [memories, agentFilter]);

  // Get longterm memories
  const longtermMemories = useMemo(() => {
    return memories.filter(m => m.memory_type === 'longterm');
  }, [memories]);

  function getTypeColor(type) {
    switch (type) {
      case 'conversation': return '#3b82f6';
      case 'longterm': return '#10b981';
      case 'note': return '#f59e0b';
      case 'insight': return '#8b5cf6';
      default: return '#888';
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function deleteMemory(id) {
    if (!confirm('Delete this memory?')) return;
    await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
    fetchMemories();
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Memory <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({memories.length})</span></h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Journal of agent conversations and learned insights
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Memory
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search memories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchMemories();
          }}
        />
      </div>
      
      {/* Agent Filter */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setAgentFilter('')}
          style={{
            padding: '6px 12px',
            borderRadius: 16,
            border: 'none',
            fontSize: 12,
            background: agentFilter === '' ? '#3b82f6' : 'var(--bg-secondary)',
            color: agentFilter === '' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setAgentFilter(agent.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: 'none',
              fontSize: 12,
              background: agentFilter === agent.id ? (agent.avatar_color || '#3b82f6') : 'var(--bg-secondary)',
              color: agentFilter === agent.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: agent.avatar_color || '#3b82f6' }} />
            {agent.name}
          </button>
        ))}
      </div>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Left - Daily Memories */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Daily Memories</h2>
          
          {Object.keys(groupedMemories).length === 0 ? (
            <div className="card empty" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💾</div>
              <p style={{ color: 'var(--text-secondary)' }}>No memories yet</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Memories are saved after tasks complete</p>
            </div>
          ) : (
            Object.entries(groupedMemories).map(([date, dateMemories]) => (
              <div key={date} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--accent-green)' }}>
                  {formatDate(date)}
                </div>
                
                {dateMemories.map((memory) => (
                  <div key={memory.id} className="card" style={{ marginBottom: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, marginBottom: 6 }}>{memory.content}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ 
                            fontSize: 10, 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            background: getTypeColor(memory.memory_type) + '20',
                            color: getTypeColor(memory.memory_type)
                          }}>
                            {memory.memory_type}
                          </span>
                          
                          {memory.agent && (
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              {memory.agent.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => deleteMemory(memory.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Right - Long Term Memories */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Long Term Memory</h2>
          
          <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <p style={{ fontSize: 12, color: 'var(--accent-green)', marginBottom: 12 }}>
              Pinned important facts
            </p>
            
            {longtermMemories.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📌 No pinned memories yet</p>
            ) : (
              longtermMemories.map((memory) => (
                <div key={memory.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{memory.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {memory.agent?.name} • {formatDate(memory.memory_date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <AddMemoryModal
          agents={agents}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchMemories();
          }}
        />
      )}
    </div>
  );
}

function AddMemoryModal({ agents, onClose, onCreated }) {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [memoryType, setMemoryType] = useState('conversation');
  const [agentId, setAgentId] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        summary,
        memory_type: memoryType,
        agent_id: agentId || null,
        memory_date: memoryDate
      })
    });

    setLoading(false);

    if (res.ok) {
      onCreated();
    } else {
      const data = await res.json();
      alert('Error: ' + data.error);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Memory</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Summary</label>
            <input
              type="text"
              className="form-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={memoryType} onChange={(e) => setMemoryType(e.target.value)}>
                <option value="conversation">Conversation</option>
                <option value="longterm">Longterm</option>
                <option value="note">Note</option>
                <option value="insight">Insight</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Agent</label>
            <select className="form-select" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">Select agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
