'use client';

import { useState, useEffect } from 'react';

export default function RPAPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    task_type: 'scrape',
    target_url: '',
    instructions: ''
  });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://72.62.231.18:3001/api/rpa/results');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const runTask = async (e) => {
    e.preventDefault();
    setRunning(true);
    
    try {
      const res = await fetch('http://72.62.231.18:3001/api/rpa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        fetchTasks();
        setFormData({ task_type: 'scrape', target_url: '', instructions: '' });
      }
    } catch (e) {
      console.error(e);
    }
    
    setRunning(false);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    running: tasks.filter(t => t.status === 'running').length
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>🤖 RPA Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
          <div style={{ color: '#888' }}>Total Tasks</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
          <div style={{ color: '#888' }}>Completed</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.failed}</div>
          <div style={{ color: '#888' }}>Failed</div>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.running}</div>
          <div style={{ color: '#888' }}>Running</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Run Task Form */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <h3 style={{ marginTop: 0 }}>🚀 Run New RPA Task</h3>
          <form onSubmit={runTask}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Task Type</label>
              <select 
                value={formData.task_type}
                onChange={e => setFormData({...formData, task_type: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
              >
                <option value="scrape">Scrape Page Data</option>
                <option value="extract_links">Extract Links</option>
                <option value="screenshot">Take Screenshot</option>
                <option value="scrape_text">Scrape Text</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Target URL</label>
              <input 
                type="url"
                placeholder="https://..."
                value={formData.target_url}
                onChange={e => setFormData({...formData, target_url: e.target.value})}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Instructions (optional)</label>
              <textarea 
                placeholder='{"field": "value"} for form submission'
                value={formData.instructions}
                onChange={e => setFormData({...formData, instructions: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={running}
              style={{ width: '100%', background: '#10b981', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: running ? 'not-allowed' : 'pointer' }}
            >
              {running ? 'Running...' : 'Run Task'}
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
          <h3 style={{ marginTop: 0 }}>📋 Recent Tasks</h3>
          
          {loading ? (
            <p style={{ color: '#666' }}>Loading...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: '#666' }}>No tasks yet. Run a task to get started.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
              {tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  style={{ 
                    background: '#0a0a0a', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    border: selectedTask?.id === task.id ? '1px solid #10b981' : '1px solid #222'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{task.task_type}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>{task.target_url}</div>
                    </div>
                    <span style={{ 
                      background: task.status === 'completed' ? '#10b981' : task.status === 'failed' ? '#ef4444' : '#3b82f6',
                      color: '#000',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {task.duration_ms}ms • {new Date(task.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedTask(null)}>
          <div style={{ 
            background: '#111', padding: '2rem', borderRadius: '12px', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Task Details</h2>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Type:</strong> {selectedTask.task_type}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>URL:</strong> {selectedTask.target_url}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Status:</strong> 
              <span style={{ color: selectedTask.status === 'completed' ? '#10b981' : '#ef4444' }}> {selectedTask.status}</span>
            </div>
            {selectedTask.error_message && (
              <div style={{ marginBottom: '1rem', color: '#ef4444' }}>
                <strong>Error:</strong> {selectedTask.error_message}
              </div>
            )}
            
            {selectedTask.result && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Result:</strong>
                <pre style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxHeight: '300px', fontSize: '0.85rem' }}>
                  {JSON.stringify(JSON.parse(selectedTask.result), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
