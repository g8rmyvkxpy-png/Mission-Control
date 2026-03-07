'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BrainPage() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [quickCapture, setQuickCapture] = useState('');
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);

  // Fetch entries
  async function fetchEntries() {
    try {
      const res = await fetch('/api/brain');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('brain-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'second_brain' }, () => {
        fetchEntries();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // CMD+K to open search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSelectedEntry(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search as you type
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/brain/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Quick capture
  async function handleQuickCapture(e) {
    e.preventDefault();
    if (!quickCapture.trim()) return;

    // Auto-detect type
    let type = 'note';
    if (quickCapture.startsWith('http')) type = 'link';
    else if (quickCapture.toLowerCase().includes('read')) type = 'book';

    try {
      await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickCapture.substring(0, 50),
          content: quickCapture,
          type
        })
      });
      setQuickCapture('');
      fetchEntries();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  // Filter entries
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.type === filter);

  // Group by type for masonry layout
  const types = ['note', 'link', 'book', 'idea', 'task', 'reminder', 'resource'];
  const typeLabels = {
    note: '📝 Notes',
    link: '🔗 Links',
    book: '📚 Books',
    idea: '💡 Ideas',
    task: '✅ Tasks',
    reminder: '⏰ Reminders',
    resource: '📦 Resources'
  };

  // Delete entry
  async function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/brain/${id}`, { method: 'DELETE' });
    fetchEntries();
    setSelectedEntry(null);
  }

  // Update entry
  async function updateEntry(id, updates) {
    await fetch(`/api/brain/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchEntries();
  }

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '0 24px 24px' }}>
      {/* Header with CMD+K hint */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🧠 Second Brain</h1>
        <div 
          onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
          style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)', 
            borderRadius: 8, 
            padding: '12px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#6b7280'
          }}
        >
          <span>🔍</span>
          <span style={{ flex: 1 }}>Search across Brain, Memory, Docs, Tasks, Activity...</span>
          <kbd style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>⌘K</kbd>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            background: filter === 'all' ? '#3b82f6' : 'var(--bg-card)',
            color: filter === 'all' ? '#fff' : 'var(--text)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500
          }}
        >
          All
        </button>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              background: filter === type ? '#3b82f6' : 'var(--bg-card)',
              color: filter === type ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
            <p>No entries yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Use the quick capture bar below to add one!</p>
          </div>
        ) : (
          <div style={{ 
            columns: 3, 
            columnGap: 16,
            '@media (max-width: 1200px)': { columns: 2 },
            '@media (max-width: 800px)': { columns: 1 }
          }}>
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  breakInside: 'avoid',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '2px 8px', 
                    borderRadius: 10,
                    background: entry.type === 'idea' ? '#f59e0b20' : 
                               entry.type === 'link' ? '#3b82f620' :
                               entry.type === 'book' ? '#8b5cf620' :
                               entry.type === 'task' ? '#22c55e20' :
                               entry.type === 'reminder' ? '#f9731620' :
                               entry.type === 'resource' ? '#06b6d420' : '#6b728020',
                    color: entry.type === 'idea' ? '#f59e0b' : 
                           entry.type === 'link' ? '#3b82f6' :
                           entry.type === 'book' ? '#8b5cf6' :
                           entry.type === 'task' ? '#22c55e' :
                           entry.type === 'reminder' ? '#f97316' :
                           entry.type === 'resource' ? '#06b6d4' : '#6b7280',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {entry.type}
                  </span>
                </div>
               <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                  {entry.title}
                </h3>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5, marginBottom: 12 }}>
                  {entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}
                </p>
                {entry.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {entry.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: 11, color: '#6b7280', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 12 }}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Capture Bar */}
      <form onSubmit={handleQuickCapture} style={{ 
        marginTop: 16, 
        display: 'flex', 
        gap: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12
      }}>
        <input
          type="text"
          value={quickCapture}
          onChange={(e) => setQuickCapture(e.target.value)}
          placeholder="Quick capture... (Press Enter to save)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text)'
          }}
        />
        <button 
          type="submit"
          disabled={!quickCapture.trim()}
          style={{
            background: quickCapture.trim() ? '#3b82f6' : '#374151',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: quickCapture.trim() ? 'pointer' : 'not-allowed',
            fontSize: 13,
            fontWeight: 500
          }}
        >
          Add
        </button>
      </form>

      {/* Search Modal */}
      {showSearch && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 100,
          zIndex: 1000
        }} onClick={() => setShowSearch(false)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            width: '600px',
            maxHeight: '500px',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                autoFocus
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 18,
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {searchResults.length === 0 && searchQuery.length > 1 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  No results found
                </div>
              )}
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedEntry(result); setShowSearch(false); }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <span style={{ 
                    fontSize: 11, 
                    padding: '2px 8px', 
                    borderRadius: 10,
                    background: '#3b82f620',
                    color: '#3b82f6',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {result.sourceLabel}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{result.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {result.content?.substring(0, 60)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedEntry(null)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ 
                  fontSize: 12, 
                  padding: '4px 10px', 
                  borderRadius: 10,
                  background: '#3b82f620',
                  color: '#3b82f6',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {selectedEntry.type || selectedEntry.source}
                </span>
                <button 
                  onClick={() => deleteEntry(selectedEntry.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 18
                  }}
                >
                  🗑️
                </button>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{selectedEntry.title}</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>
                {selectedEntry.content}
              </p>
              {selectedEntry.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {selectedEntry.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: 12, color: '#6b7280', background: 'var(--bg)', padding: '4px 8px', borderRadius: 6 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#4b5563' }}>
                Created: {new Date(selectedEntry.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
