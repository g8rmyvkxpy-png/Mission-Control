'use client';

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import NewTaskModal from '@/components/NewTaskModal';

const priorityFilters = [
  { value: '', label: 'All Priorities' },
  { value: 'P0', label: 'P0 - Critical', color: '#ef4444' },
  { value: 'P1', label: 'P1 - High', color: '#f59e0b' },
  { value: 'P2', label: 'P2 - Medium', color: '#3b82f6' },
  { value: 'P3', label: 'P3 - Low', color: '#6b7280' },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [newTaskModal, setNewTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
    
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTasks() {
    let url = '/api/tasks';
    const params = [];
    if (filterAgent) params.push(`agent_id=${filterAgent}`);
    if (filterPriority) params.push(`priority=${filterPriority}`);
    if (params.length > 0) url += '?' + params.join('&');
    
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

  function handleFilterChange() {
    setLoading(true);
    fetchTasks();
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

  // Stats
  const backlogCount = tasks.filter(t => t.status === 'backlog').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  
  const p0Count = tasks.filter(t => t.priority_score === 0).length;
  const p1Count = tasks.filter(t => t.priority_score === 1).length;
  const overdueCount = tasks.filter(t => t.isOverdue).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>✅ Task Board</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Drag tasks between columns to update status
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setNewTaskModal(true)}>
          + New Task
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24, 
        flexWrap: 'wrap',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 8,
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>To Do:</span>
          <span style={{ fontWeight: 600, color: '#f59e0b' }}>{backlogCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>In Progress:</span>
          <span style={{ fontWeight: 600, color: '#3b82f6' }}>{inProgressCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Done:</span>
          <span style={{ fontWeight: 600, color: '#10b981' }}>{doneCount}</span>
        </div>
        
        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>P0:</span>
          <span style={{ fontWeight: 600, color: '#ef4444' }}>{p0Count}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>P1:</span>
          <span style={{ fontWeight: 600, color: '#f59e0b' }}>{p1Count}</span>
        </div>
        
        {overdueCount > 0 && (
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⚠️ Overdue:</span>
            <span style={{ fontWeight: 600, color: '#ef4444' }}>{overdueCount}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={filterPriority}
          onChange={(e) => {
            setFilterPriority(e.target.value);
            setTimeout(handleFilterChange, 0);
          }}
        >
          {priorityFilters.map(p => (
            <option key={p.value} value={p.value} style={p.color ? { color: p.color } : {}}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={filterAgent}
          onChange={(e) => {
            setFilterAgent(e.target.value);
            setTimeout(handleFilterChange, 0);
          }}
        >
          <option value="">All Agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>

        <button 
          className="btn btn-secondary" 
          onClick={async () => {
            const doneTasks = tasks.filter(t => t.status === 'done');
            for (const task of doneTasks) {
              await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
            }
            fetchTasks();
          }}
          style={{ fontSize: 12, marginLeft: 'auto' }}
        >
          🗑️ Clear Done ({doneCount})
        </button>
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
