'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import NewTaskModal from '@/components/NewTaskModal';

export default function BoardPage() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState('');
  const [newTaskModal, setNewTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
    
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTasks() {
    let url = '/api/tasks';
    if (filterAgent) url += `?agent_id=${filterAgent}`;
    
    const res = await fetch(url);
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function handleStatusChange(taskId, newStatus) {
    const res = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.ok) {
      fetchTasks();
    }
  }

  async function handleApprove(taskId) {
    const res = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    });
    
    if (res.ok) {
      fetchTasks();
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Task Board</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Drag tasks between columns to update status
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={async () => {
            const doneTasks = tasks.filter(t => t.status === 'done');
            for (const task of doneTasks) {
              await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
            }
            fetchTasks();
          }} style={{ fontSize: 12 }}>
            Clear Done ({tasks.filter(t => t.status === 'done').length})
          </button>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterAgent}
            onChange={(e) => {
              setFilterAgent(e.target.value);
              fetchTasks();
            }}
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={() => setNewTaskModal(true)}>
            + New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          agents={agents}
          onStatusChange={handleStatusChange}
          onApprove={handleApprove}
        />
      )}

      {/* New Task Modal */}
      {newTaskModal && (
        <NewTaskModal
          agents={agents}
          onClose={() => setNewTaskModal(false)}
          onCreated={() => {
            setNewTaskModal(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
