'use client';

import { useState, useEffect } from 'react';

interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface Knowledge {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
}

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export default function Memory({ theme }: { theme: Theme }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState({ title: '', content: '', tags: '' });
  const [view, setView] = useState<'memories' | 'knowledge'>('knowledge');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setMemories(data.memories || []);
      setKnowledge(data.knowledge || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  // Filter based on search
  const filteredMemories = memories.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredKnowledge = knowledge.filter(k =>
    k.title.toLowerCase().includes(search.toLowerCase()) ||
    k.problem.toLowerCase().includes(search.toLowerCase()) ||
    k.solution.toLowerCase().includes(search.toLowerCase()) ||
    k.category.toLowerCase().includes(search.toLowerCase())
  );

  const saveMemories = async (newMemories: Memory[]) => {
    setMemories(newMemories);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories: newMemories, tasks: [], events: [], activities: [], content: [], knowledge: knowledge, chatMessages: [] }),
      });
    } catch (e) {
      console.error('Failed to save memories:', e);
    }
  };

  const addMemory = () => {
    if (!newMemory.title.trim()) return;
    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      content: newMemory.content,
      tags: newMemory.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    saveMemories([memory, ...memories]);
    setNewMemory({ title: '', content: '', tags: '' });
    setShowAdd(false);
  };

  const deleteMemory = (id: string) => {
    saveMemories(memories.filter(m => m.id !== id));
    setSelectedMemory(null);
  };

  return (
    <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text }}>Memory & Knowledge</h2>
        {view === 'memories' && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: '10px 20px',
              background: theme.accent,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Add Memory
          </button>
        )}
      </div>

      {/* View Toggle & Search */}
      <div style={{ marginBottom: '24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setView('knowledge')}
            style={{
              padding: '10px 20px',
              background: view === 'knowledge' ? theme.accent : theme.surface,
              border: `1px solid ${view === 'knowledge' ? theme.accent : theme.border}`,
              borderRadius: '8px',
              color: view === 'knowledge' ? '#fff' : theme.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📚 Knowledge Base
          </button>
          <button
            onClick={() => setView('memories')}
            style={{
              padding: '10px 20px',
              background: view === 'memories' ? theme.accent : theme.surface,
              border: `1px solid ${view === 'memories' ? theme.accent : theme.border}`,
              borderRadius: '8px',
              color: view === 'memories' ? '#fff' : theme.text,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🧠 Memories
          </button>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder={view === 'knowledge' ? "Search problems, solutions, categories..." : "Search memories..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            color: theme.text,
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Knowledge Base View */}
      {view === 'knowledge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredKnowledge.length > 0 ? filteredKnowledge.map((kb) => (
            <div 
              key={kb.id}
              style={{ 
                background: theme.surface, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '12px', 
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, margin: 0 }}>{kb.title}</h3>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '11px',
                  background: theme.border,
                  color: theme.textSecondary,
                }}>
                  {kb.category}
                </span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>❌ Problem:</p>
                <p style={{ color: theme.textSecondary, fontSize: '13px', marginLeft: '12px' }}>{kb.problem}</p>
              </div>
              <div>
                <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>✅ Solution:</p>
                <pre style={{ 
                  color: theme.textSecondary, 
                  fontSize: '12px', 
                  marginLeft: '12px', 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  background: theme.background,
                  padding: '12px',
                  borderRadius: '6px',
                }}>{kb.solution}</pre>
              </div>
            </div>
          )) : (
            <p style={{ color: theme.textSecondary }}>No knowledge base entries found</p>
          )}
        </div>
      )}

      {/* Memories View */}
      {view === 'memories' && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Title"
            value={newMemory.title}
            onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />
          <textarea
            placeholder="Write your memory..."
            value={newMemory.content}
            onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              marginBottom: '12px',
              minHeight: '150px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newMemory.tags}
            onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addMemory}
              style={{
                padding: '10px 20px',
                background: theme.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save Memory
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedMemory ? '1fr 1fr' : '1fr', gap: '16px' }}>
        {/* Memories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredMemories.length === 0 ? (
            <p style={{ color: theme.textSecondary, textAlign: 'center', padding: '40px' }}>
              {search ? 'No memories found' : 'No memories yet. Add your first memory!'}
            </p>
          ) : (
            filteredMemories.map(memory => (
              <div
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                style={{
                  background: theme.surface,
                  border: `1px solid ${selectedMemory?.id === memory.id ? theme.accent : theme.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginBottom: '8px' }}>
                  {memory.title}
                </h4>
                <p style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {memory.content}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {memory.tags.map((tag, i) => (
                    <span key={i} style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${theme.accent}20`,
                      color: theme.accent,
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Memory Detail */}
        {selectedMemory && (
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            maxHeight: '70vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>{selectedMemory.title}</h3>
              <button
                onClick={() => deleteMemory(selectedMemory.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                🗑️
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {selectedMemory.tags.map((tag, i) => (
                <span key={i} style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: `${theme.accent}20`,
                  color: theme.accent,
                }}>
                  #{tag}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: theme.text, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {selectedMemory.content}
            </p>
            <p style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '24px' }}>
              Created: {new Date(selectedMemory.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
