'use client';

import { useState } from 'react';

export default function NewCronModal({ agents, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState('');
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every Monday at 9am', value: '0 9 * * 1' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(false);

    const res = await fetch('/api/crons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        agent_id: agentId,
        cron_expression: cronExpression
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
          <h2 className="modal-title">Create Cron Job</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Report"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this cron job do?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Agent</label>
            <select
              className="form-select"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cron Expression</label>
            <input
              type="text"
              className="form-input"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="*/5 * * * *"
            />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Presets:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: 10 }}
                    onClick={() => setCronExpression(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Cron Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
