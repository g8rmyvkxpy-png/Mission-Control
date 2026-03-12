'use client';

import { useState, useEffect } from 'react';

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '')        // remove # headings
    .replace(/\*\*(.*?)\*\*/g, '$1')     // remove bold
    .replace(/\*(.*?)\*/g, '$1')         // remove italic
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // remove links
    .replace(/^[-*+]\s+/gm, '')          // remove list bullets
    .replace(/^>\s+/gm, '')               // remove blockquotes
    .replace(/^(ACTION|TITLE|CONTENT|FILE|REASON):\s*.*/gm, '') // remove agent action lines
    .replace(/^[-—]{3,}/gm, '')          // remove horizontal rules
    .replace(/\n{2,}/g, ' ')             // collapse multiple newlines
    .trim();
}

export default function DocsPage() {
  const [docs, setDocs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDocs();
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [search, categoryFilter, formatFilter]);

  async function fetchDocs() {
    let url = '/api/docs?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (categoryFilter) url += `category=${categoryFilter}&`;
    if (formatFilter) url += `format=${formatFilter}&`;
    
    const res = await fetch(url);
    const data = await res.json();
    setDocs(data.docs || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  function getCategoryColor(category) {
    const colors = {
      newsletter: '#8b5cf6',
      script: '#06b6d4',
      plan: '#f59e0b',
      research: '#10b981',
      report: '#3b82f6',
      general: '#888'
    };
    return colors[category] || '#888';
  }

  function getFormatColor(format) {
    const colors = {
      markdown: '#10b981',
      plaintext: '#888',
      html: '#f59e0b',
      json: '#3b82f6'
    };
    return colors[format] || '#888';
  }

  async function deleteDoc(id) {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/docs?id=${id}`, { method: 'DELETE' });
    fetchDocs();
    setSelectedDoc(null);
  }

  function renderMarkdown(content) {
    if (!content) return '';
    return content
      // Tables - convert |---| to styled table rows
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.every(c => c.trim().match(/^-+$/))) {
          return ''; // Skip separator rows
        }
        const row = cells.map(c => `<td style="padding: 4px 8px; border: 1px solid #30363d;">${c.trim()}</td>`).join('');
        return `<tr>${row}</tr>`;
      })
      .replace(/(<tr>.*?<\/tr>)+/g, '<table style="border-collapse: collapse; margin: 8px 0;">$&</table>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background: #21262d; padding: 2px 4px; border-radius: 4px;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const cardStyle = {
    overflow: 'hidden',
    minWidth: 0,
    wordBreak: 'break-word',
    cursor: 'pointer'
  };

  const titleStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    fontWeight: 600,
    marginBottom: 8
  };

  const previewStyle = {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
    fontSize: 12,
    color: 'var(--text-secondary)',
    marginBottom: 12
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>Docs</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Agent-generated documents and content
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          + New Document
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search docs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select className="form-select" style={{ width: 150 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="newsletter">Newsletter</option>
          <option value="script">Script</option>
          <option value="plan">Plan</option>
          <option value="research">Research</option>
          <option value="report">Report</option>
          <option value="general">General</option>
        </select>
        <select className="form-select" style={{ width: 150 }} value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
          <option value="">All Formats</option>
          <option value="markdown">Markdown</option>
          <option value="plaintext">Plaintext</option>
          <option value="html">HTML</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {/* Docs Grid */}
      {docs.length === 0 ? (
        <div className="card empty" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          <p style={{ color: 'var(--text-secondary)' }}>No documents yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Agent-generated content will appear here</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
          gap: 16, 
          width: '100%',
          overflow: 'hidden'
        }}>
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={cardStyle}
              onClick={() => setSelectedDoc(doc)}
            >
              <div style={titleStyle}>{doc.title}</div>
              
              <p style={previewStyle}>
                {stripMarkdown(doc.content).substring(0, 100)}...
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {doc.agent && <span style={{ fontSize: 10, color: doc.agent.avatar_color || '#3b82f6' }}>{doc.agent.name}</span>}
                  <span style={{ 
                    fontSize: 10, padding: '2px 6px', borderRadius: 4, 
                    background: getCategoryColor(doc.category) + '20', color: getCategoryColor(doc.category)
                  }}>
                    {doc.category}
                  </span>
                  <span style={{ 
                    fontSize: 10, padding: '2px 6px', borderRadius: 4, 
                    background: getFormatColor(doc.format) + '20', color: getFormatColor(doc.format)
                  }}>
                    {doc.format}
                  </span>
                </div>
                
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {doc.word_count} words
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      {showNewModal && (
        <NewDocModal
          agents={agents}
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchDocs();
          }}
        />
      )}

      {/* Document Viewer */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedDoc.title}</h2>
              <button className="modal-close" onClick={() => setSelectedDoc(null)}>×</button>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              <span style={{ 
                fontSize: 10, padding: '2px 8px', borderRadius: 4, 
                background: getCategoryColor(selectedDoc.category) + '20', color: getCategoryColor(selectedDoc.category)
              }}>
                {selectedDoc.category}
              </span>
              <span style={{ 
                fontSize: 10, padding: '2px 8px', borderRadius: 4, 
                background: getFormatColor(selectedDoc.format) + '20', color: getFormatColor(selectedDoc.format)
              }}>
                {selectedDoc.format}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {selectedDoc.word_count} words
              </span>
            </div>

            <div style={{ 
              background: 'var(--bg-tertiary)', 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 16,
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              {selectedDoc.format === 'markdown' ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content) }} />
              ) : (
                selectedDoc.content
              )}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
              Created: {new Date(selectedDoc.created_at).toLocaleString()}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn" 
                onClick={() => {
                  navigator.clipboard.writeText(selectedDoc.content);
                }}
              >
                📋 Copy
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => deleteDoc(selectedDoc.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewDocModal({ agents, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [format, setFormat] = useState('markdown');
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, format, agent_id: agentId || null })
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
          <h2 className="modal-title">New Document</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="newsletter">Newsletter</option>
                <option value="script">Script</option>
                <option value="plan">Plan</option>
                <option value="research">Research</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Format</label>
              <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="markdown"> Markdown</option>
                <option value="plaintext">Plaintext</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
              </select>
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
              {loading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
