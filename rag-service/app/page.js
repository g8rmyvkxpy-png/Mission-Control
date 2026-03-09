'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function RAGDemo() {
  const [client, setClient] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    const savedClient = localStorage.getItem('pp_client');
    if (savedClient) {
      setClient(JSON.parse(savedClient));
    }
  }, []);

  useEffect(() => {
    if (client) {
      fetchDocuments();
    }
  }, [client]);

  const fetchDocuments = async () => {
    const res = await fetch(`/api/rag/documents?clientId=${client.id}`);
    const data = await res.json();
    setDocuments(data.documents || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('http://72.62.231.18:3004/api/clients');
    const data = await res.json();
    const foundClient = data.clients?.find(c => c.email === email);
    
    if (foundClient) {
      setClient(foundClient);
      localStorage.setItem('pp_client', JSON.stringify(foundClient));
    } else {
      alert('Client not found');
    }
    setLoading(false);
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, query })
      });
      const data = await res.json();
      setAnswer(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadContent.trim()) return;
    
    setUploading(true);
    try {
      const res = await fetch('/api/rag/upload', {
        method: 'POST',
        body: new URLSearchParams({
          clientId: client.id,
          title: uploadTitle || 'Untitled',
          content: uploadContent
        })
      });
      const data = await res.json();
      setUploadResult(data);
      fetchDocuments();
      setUploadContent('');
      setUploadTitle('');
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  if (!client) {
    return (
      <>
        <Head>
          <title>Login - RAG Demo</title>
        </Head>
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
          <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><span style={{ color: '#10b981' }}>PP</span>Ventures RAG</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Login to access your knowledge base</p>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem', marginBottom: '1rem' }} />
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#10b981', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Ask Your Data - PPVentures RAG</title>
      </Head>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui' }}>
        <header style={{ padding: '1rem 2rem', background: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ color: '#10b981' }}>PP</span>Ventures RAG | <span style={{ color: '#888' }}>{client.business_name}</span></div>
          <button onClick={() => { setClient(null); localStorage.removeItem('pp_client'); }} style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </header>

        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🧠 Ask Your Data</h1>
          
          {/* Upload Section */}
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>📤 Upload Document</h2>
            <form onSubmit={handleUpload}>
              <input type="text" placeholder="Document title" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }} />
              <textarea placeholder="Paste your document content here..." value={uploadContent} onChange={e => setUploadContent(e.target.value)} rows={6}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'inherit' }} />
              <button type="submit" disabled={uploading}
                style={{ background: '#10b981', color: '#000', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
            {uploadResult && <p style={{ color: '#10b981', marginTop: '0.5rem' }}>✅ Uploaded! Created {uploadResult.chunksCreated} chunks.</p>}
          </div>

          {/* Documents List */}
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>📚 Your Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <p style={{ color: '#666' }}>No documents yet. Upload some to get started!</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{doc.title}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>{doc.chunk_count} chunks • {doc.status}</div>
                    </div>
                    <span style={{ background: doc.status === 'ready' ? '#10b981' : '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{doc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Query Section */}
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
            <h2 style={{ marginTop: 0 }}>❓ Ask a Question</h2>
            <form onSubmit={handleQuery}>
              <input type="text" placeholder="Ask anything about your documents..." value={query} onChange={e => setQuery(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }} />
              <button type="submit" disabled={loading}
                style={{ background: '#3b82f6', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Thinking...' : 'Ask Question'}
              </button>
            </form>

            {answer && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#0a0a0a', borderRadius: '8px' }}>
                <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '1rem' }}>Answer:</div>
                <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{answer.answer}</p>
                
                {answer.chunks?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Sources:</div>
                    {answer.chunks.map((chunk, i) => (
                      <div key={i} style={{ background: '#111', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                        [{i + 1}] {chunk.summary}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
                  <span>Faithfulness: {(answer.faithfulness * 100).toFixed(0)}%</span>
                  <span>Relevance: {(answer.relevance * 100).toFixed(0)}%</span>
                  <span>Latency: {answer.latency}ms</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
