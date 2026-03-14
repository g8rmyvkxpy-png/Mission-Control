'use client';

import { useState } from 'react';

const priorityOptions = [
  { value: 'P0', label: 'P0 - Critical', color: '#ef4444', desc: 'Urgent, needs immediate attention' },
  { value: 'P1', label: 'P1 - High', color: '#f59e0b', desc: 'Important, do soon' },
  { value: 'P2', label: 'P2 - Medium', color: '#3b82f6', desc: 'Normal priority' },
  { value: 'P3', label: 'P3 - Low', color: '#6b7280', desc: 'Can wait' },
];

export default function NewTaskModal({ agents, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('P2');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        assigned_to: assignedTo || null,
        priority,
        due_date: dueDate || null,
        created_by: 'dashboard'
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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select
                className="form-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {priorityOptions.map((p) => (
                <label
                  key={p.value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `2px solid ${priority === p.value ? p.color : 'var(--border-color)'}`,
                    background: priority === p.value ? `${p.color}15` : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: 14, 
                    color: p.color 
                  }}>
                    {p.value}
                  </span>
                  <span style={{ 
                    fontSize: 9, 
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    marginTop: 2
                  }}>
                    {p.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
