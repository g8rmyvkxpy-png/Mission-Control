'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export const dynamic = 'force-dynamic';

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({ title: '', content: '', tags: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setMemories(data.memories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search 
    ? memories.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase()) ||
        m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : memories;

  const addMemory = () => {
    if (!newMemory.title || !newMemory.content) return;
    
    const memory: Memory = {
      id: `mem-${Date.now()}`,
      title: newMemory.title,
      content: newMemory.content,
      tags: newMemory.tags ? newMemory.tags.split(',').map(t => t.trim()) : [],
      createdAt: new Date().toISOString()
    };
    
    const updated = [memory, ...memories];
    setMemories(updated);
    setNewMemory({ title: '', content: '', tags: '' });
    
    // Save to localStorage for persistence in this session
    localStorage.setItem('memories', JSON.stringify(updated));
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Memory</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Memory 🧠</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Your knowledge base</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: selectedMemory ? '1fr 400px' : '1fr', gap: 24}}>
          {/* Main Area */}
          <div>
            {/* Search & Add */}
            <div className="card" style={{padding: 24, marginBottom: 24}}>
              <div style={{display: 'flex', gap: 12, marginBottom: 16}}>
                <input 
                  type="text" 
                  placeholder="Search memories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{flex: 1, padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14}}
                />
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <input 
                  type="text" 
                  placeholder="Title"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
                  style={{flex: 1, padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14}}
                />
                <input 
                  type="text" 
                  placeholder="Tags (comma separated)"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({...newMemory, tags: e.target.value})}
                  style={{flex: 1, padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14}}
                />
              </div>
              <textarea 
                placeholder="Write your memory..."
                value={newMemory.content}
                onChange={(e) => setNewMemory({...newMemory, content: e.target.value})}
                style={{width: '100%', marginTop: 12, padding: '12px 16px', background: '#030712', border: '1px solid #30363d', borderRadius: 8, color: '#f0f6fc', fontSize: 14, minHeight: 100, resize: 'vertical'}}
              />
              <button 
                onClick={addMemory}
                disabled={!newMemory.title || !newMemory.content}
                style={{marginTop: 12, padding: '12px 24px', background: newMemory.title && newMemory.content ? '#2f81f7' : '#30363d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: newMemory.title && newMemory.content ? 'pointer' : 'not-allowed'}}
              >
                Save Memory
              </button>
            </div>

            {/* Memories List */}
            {loading ? (
              <div className="card" style={{padding: 40, textAlign: 'center'}}>
                <p style={{color: '#8b949e'}}>Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card" style={{padding: 40, textAlign: 'center'}}>
                <p style={{color: '#8b949e'}}>{search ? 'No memories found' : 'No memories yet. Add your first memory!'}</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                {filtered.map(memory => (
                  <div 
                    key={memory.id} 
                    className="card" 
                    style={{padding: 20, cursor: 'pointer', border: selectedMemory?.id === memory.id ? '2px solid #2f81f7' : '2px solid transparent'}}
                    onClick={() => setSelectedMemory(memory)}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div>
                        <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{memory.title}</h3>
                        <p style={{margin: '8px 0 0', color: '#8b949e', fontSize: 14, lineHeight: 1.5}}>{memory.content.substring(0, 150)}...</p>
                      </div>
                      <span style={{fontSize: 12, color: '#8b949e'}}>{new Date(memory.createdAt).toLocaleDateString()}</span>
                    </div>
                    {memory.tags && memory.tags.length > 0 && (
                      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
                        {memory.tags.map((tag, i) => (
                          <span key={i} style={{padding: '2px 8px', background: 'rgba(47,129,247,0.15)', color: '#2f81f7', borderRadius: 12, fontSize: 12}}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedMemory && (
            <div className="card" style={{padding: 24, position: 'sticky', top: 100, maxHeight: 'calc(100vh - 150px)', overflow: 'auto'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h3 style={{margin: 0}}>Memory Details</h3>
                <button onClick={() => setSelectedMemory(null)} style={{background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18}}>✕</button>
              </div>
              <h2 style={{margin: '0 0 16px', fontSize: 20}}>{selectedMemory.title}</h2>
              <p style={{color: '#f0f6fc', lineHeight: 1.7, whiteSpace: 'pre-wrap'}}>{selectedMemory.content}</p>
              {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                <div style={{display: 'flex', gap: 8, marginTop: 16}}>
                  {selectedMemory.tags.map((tag, i) => (
                    <span key={i} style={{padding: '4px 12px', background: 'rgba(47,129,247,0.15)', color: '#2f81f7', borderRadius: 12, fontSize: 12}}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{marginTop: 24, paddingTop: 16, borderTop: '1px solid #21262d', fontSize: 12, color: '#8b949e'}}>
                Created: {new Date(selectedMemory.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/memory" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>🧠</span><span style={{fontSize: 10}}>Memory</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
