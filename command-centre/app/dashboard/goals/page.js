'use client';

import { useState, useEffect } from 'react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brainDump, setBrainDump] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const categoryColors = {
    business: { bg: '#3b82f6', text: '#fff' },
    personal: { bg: '#8b5cf6', text: '#fff' },
    content: { bg: '#10b981', text: '#fff' },
    technical: { bg: '#f97316', text: '#fff' },
    financial: { bg: '#eab308', text: '#000' },
    health: { bg: '#ec4899', text: '#fff' },
    general: { bg: '#6b7280', text: '#fff' }
  };

  const timeframeLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    longterm: 'Long-term'
  };

  useEffect(() => {
    fetchGoals();
    fetchGeneratedTasks();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
    setLoading(false);
  }

  async function fetchGeneratedTasks() {
    try {
      const res = await fetch('/api/goals/generated-today');
      const data = await res.json();
      setGeneratedTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch generated tasks:', err);
    }
  }

  async function processBrainDump() {
    if (!brainDump.trim()) return;
    setProcessing(true);
    
    try {
      const res = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MINIMAX_API_KEY || 'placeholder'}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: 'Extract goals from the following brain dump. Return a JSON array of goals with fields: title (short title), description (1 sentence description), category (one of: business, personal, content, technical, financial, health, general), priority (1-5), timeframe (one of: daily, weekly, monthly, quarterly, longterm). Return ONLY valid JSON array, no other text.' },
            { role: 'user', content: brainDump }
          ]
        })
      });
      
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse JSON
      let extractedGoals = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          extractedGoals = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse goals:', e);
      }
      
      // Create each goal
      for (const goal of extractedGoals) {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goal)
        });
      }
      
      setBrainDump('');
      fetchGoals();
    } catch (err) {
      console.error('Failed to process brain dump:', err);
    }
    setProcessing(false);
  }

  async function generateTasksNow() {
    setGenerating(true);
    try {
      const res = await fetch('/api/goals/generate-tasks', { method: 'POST' });
      const data = await res.json();
      console.log('Generated tasks:', data);
      fetchGeneratedTasks();
    } catch (err) {
      console.error('Failed to generate tasks:', err);
    }
    setGenerating(false);
  }

  async function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    fetchGoals();
  }

  async function updateGoal(id, updates) {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setEditingGoal(null);
    fetchGoals();
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Goals</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Brain dump your goals and let agents create tasks to achieve them
        </p>
      </div>

      {/* Brain Dump Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🧠 What are you working towards?</h2>
        <textarea
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          placeholder="I want to grow my YouTube to 100k, build a SaaS product, get fit and lose 10kg, make $10k/month..."
          style={{
            width: '100%',
            height: 100,
            padding: 12,
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-secondary)',
            color: 'var(--text)',
            fontSize: 14,
            resize: 'vertical',
            marginBottom: 12
          }}
        />
        <button 
          className="btn btn-primary"
          onClick={processBrainDump}
          disabled={processing || !brainDump.trim()}
        >
          {processing ? 'Processing...' : 'Process Brain Dump'}
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your Goals</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const title = prompt('Goal title:');
              if (title) {
                fetch('/api/goals', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, priority: 3 })
                }).then(() => fetchGoals());
              }
            }}
          >
            + Add Goal Manually
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="card empty" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <p style={{ color: 'var(--text-secondary)' }}>No goals yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Brain dump above or add manually</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {goals.map(goal => (
              <div key={goal.id} className="card" style={{ position: 'relative' }}>
                {/* Category Badge */}
                <div style={{ 
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 500,
                  background: categoryColors[goal.category]?.bg || '#6b7280',
                  color: categoryColors[goal.category]?.text || '#fff',
                  marginBottom: 8
                }}>
                  {goal.category}
                </div>
                
                {/* Title */}
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{goal.title}</h3>
                
                {/* Description */}
                {goal.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {goal.description}
                  </p>
                )}
                
                {/* Meta */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                  {/* Priority Stars */}
                  <span style={{ color: '#eab308' }}>
                    {'★'.repeat(goal.priority)}{'☆'.repeat(5 - goal.priority)}
                  </span>
                  
                  {/* Timeframe */}
                  <span style={{ 
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-muted)'
                  }}>
                    {timeframeLabels[goal.timeframe]}
                  </span>
                  
                  {/* Status */}
                  <span style={{ 
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: goal.status === 'active' ? '#10b981' : '#6b7280',
                    color: '#fff',
                    fontSize: 10
                  }}>
                    {goal.status}
                  </span>
                </div>
                
                {/* Actions */}
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                  <button 
                    onClick={() => setEditingGoal(goal)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Generated Tasks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Today's Agent Tasks</h2>
          <button 
            className="btn btn-primary"
            onClick={generateTasksNow}
            disabled={generating || goals.length === 0}
          >
            {generating ? 'Generating...' : 'Generate Tasks Now'}
          </button>
        </div>

        {generatedTasks.length === 0 ? (
          <div className="card empty" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <p style={{ color: 'var(--text-secondary)' }}>No tasks generated today</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click "Generate Tasks Now" to create tasks from your goals</p>
          </div>
        ) : (
          <div className="card">
            {generatedTasks.map(task => (
              <div 
                key={task.id}
                style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    {task.task?.title || 'Untitled task'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    From goal: {task.goal?.title || 'General'} • {task.task?.agent?.name || 'Unassigned'}
                  </div>
                </div>
                <span style={{ 
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  background: task.task?.status === 'done' ? '#10b981' : 
                             task.task?.status === 'in-progress' ? '#3b82f6' : '#6b7280',
                  color: '#fff'
                }}>
                  {task.task?.status || 'backlog'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="modal-overlay" onClick={() => setEditingGoal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Edit Goal</h3>
            <input
              type="text"
              defaultValue={editingGoal.title}
              id="edit-title"
              className="form-input"
              style={{ marginBottom: 12 }}
            />
            <textarea
              defaultValue={editingGoal.description || ''}
              id="edit-desc"
              className="form-input"
              style={{ marginBottom: 12, height: 60 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <select defaultValue={editingGoal.category} id="edit-category" className="form-input">
                {Object.keys(categoryColors).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select defaultValue={editingGoal.priority} id="edit-priority" className="form-input">
                {[1,2,3,4,5].map(p => (
                  <option key={p} value={p}>{p} ★</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  updateGoal(editingGoal.id, {
                    title: document.getElementById('edit-title').value,
                    description: document.getElementById('edit-desc').value,
                    category: document.getElementById('edit-category').value,
                    priority: parseInt(document.getElementById('edit-priority').value)
                  });
                }}
              >
                Save
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingGoal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
