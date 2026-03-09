'use client';

import { useState, useEffect } from 'react';

export default function KnowledgeBasePage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [documents, setDocuments] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchDocuments();
      fetchAnalytics();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    const res = await fetch('http://72.62.231.18:3004/api/clients');
    const data = await res.json();
    setClients(data.clients || []);
    if (data.clients?.length > 0) {
      setSelectedClient(data.clients[0].id);
    }
  };

  const fetchDocuments = async () => {
    const res = await fetch(`http://72.62.231.18:3006/api/rag/documents?clientId=${selectedClient}`);
    const data = await res.json();
    setDocuments(data.documents || []);
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`http://72.62.231.18:3006/api/rag/query?clientId=${selectedClient}`);
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchChunks = async (docId) => {
    const res = await fetch(`http://72.62.231.18:3006/api/rag/documents?documentId=${docId}`);
    const data = await res.json();
    setChunks(data.chunks || []);
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://72.62.231.18:3006/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient, query })
      });
      const data = await res.json();
      setAnswer(data);
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>🧠 Knowledge Base</h1>

      {/* Client Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ color: '#888', marginRight: '1rem' }}>Select Client:</label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          style={{
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.business_name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #222', marginBottom: '1.5rem' }}>
        {['documents', 'query', 'analytics', 'chunks'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? '#10b981' : '#666',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #10b981' : '2px solid transparent',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          <h3>📚 Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <p style={{ color: '#666' }}>No documents yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {documents.map(doc => (
                <div key={doc.id} style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{doc.title}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>
                        {doc.chunk_count} chunks • {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ 
                      background: doc.status === 'ready' ? '#10b981' : '#f59e0b', 
                      color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' 
                    }}>
                      {doc.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => fetchChunks(doc.id)}
                    style={{ marginTop: '0.5rem', background: '#222', color: '#ccc', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    View Chunks
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div>
          <h3>❓ Query Tester</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }}
            />
            <button 
              onClick={handleQuery}
              disabled={loading}
              style={{ background: '#3b82f6', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {answer && (
            <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #222' }}>
              <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>Answer:</div>
              <p style={{ lineHeight: '1.6' }}>{answer.answer}</p>
              
              {answer.chunks?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Retrieved Chunks:</div>
                  {answer.chunks.map((chunk, i) => (
                    <div key={i} style={{ background: '#0a0a0a', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Chunk {chunk.chunkIndex + 1}</div>
                      {chunk.summary}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
                <span>✅ Faithfulness: {(answer.faithfulness * 100).toFixed(0)}%</span>
                <span>🔍 Relevance: {(answer.relevance * 100).toFixed(0)}%</span>
                <span>⏱️ Latency: {answer.latency}ms</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <h3>📊 Analytics</h3>
          {analytics ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{(analytics.avgFaithfulness * 100).toFixed(0)}%</div>
                <div style={{ color: '#888' }}>Avg Faithfulness</div>
              </div>
              <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{(analytics.avgRelevance * 100).toFixed(0)}%</div>
                <div style={{ color: '#888' }}>Avg Relevance</div>
              </div>
              <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.avgLatency}ms</div>
                <div style={{ color: '#888' }}>Avg Latency</div>
              </div>
              <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{analytics.totalQueries}</div>
                <div style={{ color: '#888' }}>Total Queries</div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#666' }}>No analytics data yet.</p>
          )}
        </div>
      )}

      {/* Chunks Tab */}
      {activeTab === 'chunks' && (
        <div>
          <h3>🔍 Chunk Explorer</h3>
          {chunks.length === 0 ? (
            <p style={{ color: '#666' }}>Select a document and click "View Chunks" to explore.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {chunks.map(chunk => (
                <div key={chunk.id} style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Chunk {chunk.chunk_index + 1} ({chunk.token_count} tokens)</div>
                  <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>📝 {chunk.summary}</div>
                  <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🏷️ {chunk.keywords}</div>
                  <div style={{ color: '#555', fontSize: '0.8rem', fontStyle: 'italic' }}>❓ {chunk.hypothetical_questions?.replace(/\|\|\|/g, ', ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
