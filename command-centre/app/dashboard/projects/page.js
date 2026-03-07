'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchAgents();
    
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchProjects() {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }

  async function fetchAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'completed': return '#3b82f6';
      default: return '#888';
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#888';
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Track progress across all your projects
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card empty" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--text-secondary)' }}>No projects yet</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowNewModal(true)}>
            + Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedProject(project)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{project.title}</div>
                <span className={`status ${project.status}`} style={{ background: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                  {project.status}
                </span>
              </div>
              
              {project.description && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {project.description}
                </p>
              )}
              
              {/* Progress Bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: project.progress + '%', background: 'var(--accent-green)', borderRadius: 3 }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`priority ${project.priority}`} style={{ background: getPriorityColor(project.priority) + '20', color: getPriorityColor(project.priority) }}>
                  {project.priority}
                </span>
                
                {project.agent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div className="avatar" style={{ width: 20, height: 20, fontSize: 10, background: project.agent.avatar_color }}>
                      {project.agent.name?.[0]}
                    </div>
                  </div>
                )}
                
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {project.task_count || 0} tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal
          agents={agents}
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchProjects();
          }}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          agents={agents}
          onClose={() => {
            setSelectedProject(null);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

function NewProjectModal({ agents, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('active');
  const [ownerAgentId, setOwnerAgentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        priority,
        status,
        owner_agent_id: ownerAgentId || null,
        due_date: dueDate || null
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
          <h2 className="modal-title">New Project</h2>
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
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Agent</label>
            <select className="form-select" value={ownerAgentId} onChange={(e) => setOwnerAgentId(e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
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

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectDetailModal({ project, agents, onClose }) {
  const [projectData, setProjectData] = useState(project);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [project.id]);

  async function fetchDetails() {
    setLoading(true);
    const res = await fetch(`/api/projects?id=${project.id}`);
    const data = await res.json();
    setProjectData(data.project);
    setLinkedTasks(data.tasks || []);
    setNotes(data.notes || []);
    
    // Get all tasks for linking
    const tasksRes = await fetch('/api/tasks');
    const tasksData = await tasksRes.json();
    setAvailableTasks(tasksData.tasks || []);
    
    setLoading(false);
  }

  async function updateProgress(newProgress) {
    await fetch(`/api/projects?id=${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: newProgress })
    });
    setProjectData({ ...projectData, progress: newProgress });
  }

  async function addNote() {
    if (!newNote.trim()) return;
    
    await fetch(`/api/projects/${project.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote })
    });
    
    setNewNote('');
    fetchDetails();
  }

  async function linkTask(taskId) {
    await fetch(`/api/projects/${project.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId })
    });
    fetchDetails();
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'completed': return '#3b82f6';
      default: return '#888';
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#888';
    }
  }

  const linkedTaskIds = linkedTasks.map(t => t.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {linkedTasks.some(t => t.status === 'in-progress') ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {projectData.title}
                <span style={{ 
                  width: 10, height: 10, borderRadius: '50%', background: '#10b981',
                  animation: 'pulse 1.5s infinite'
                }} />
              </span>
            ) : linkedTasks.every(t => t.status === 'done') && linkedTasks.length > 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {projectData.title} ✅
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {projectData.title}
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6b7280' }} />
              </span>
            )}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className={`status ${projectData.status}`} style={{ background: getStatusColor(projectData.status) + '20', color: getStatusColor(projectData.status) }}>
              {projectData.status}
            </span>
            <span className={`priority ${projectData.priority}`} style={{ background: getPriorityColor(projectData.priority) + '20', color: getPriorityColor(projectData.priority) }}>
              {projectData.priority}
            </span>
          </div>

          {projectData.description && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {projectData.description}
            </p>
          )}

          {/* Progress Slider */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Progress</span>
              <span>{projectData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={projectData.progress}
              onChange={(e) => updateProgress(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Agent Activity */}
        <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Agent Activity</h3>
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '4px 10px', background: '#10b981' }}
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
            >
              ⚡ Assign to Agent
            </button>
          </div>
          
          {showAssignDropdown && (
            <div style={{ marginBottom: 12, padding: 12, background: 'var(--bg)', borderRadius: 6 }}>
              <select id="assign-agent" className="form-input" style={{ marginBottom: 8 }}>
                <option value="">Select agent...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <input
                id="assign-task-desc"
                className="form-input"
                placeholder="Task description..."
                style={{ marginBottom: 8 }}
              />
              <button
                className="btn btn-primary"
                style={{ fontSize: 11 }}
                onClick={async () => {
                  const agentId = document.getElementById('assign-agent').value;
                  const taskDesc = document.getElementById('assign-task-desc').value;
                  if (agentId && taskDesc) {
                    await fetch('/api/tasks', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: taskDesc,
                        assigned_to: agentId,
                        description: `Project: ${projectData.title}`
                      })
                    });
                    fetchTasks();
                    setShowAssignDropdown(false);
                  }
                }}
              >
                Create Task
              </button>
            </div>
          )}
          
          {linkedTasks.filter(t => t.agent).length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No agents assigned — link a task to get started</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {agents.filter(a => linkedTasks.some(t => t.assigned_to === a.id)).map(agent => {
                const agentTask = linkedTasks.find(t => t.assigned_to === agent.id);
                return (
                  <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'var(--bg)', borderRadius: 6 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: agent.avatar_color }}>
                      {agent.name?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{agentTask?.title || 'No task'}</div>
                    </div>
                    <span style={{ 
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: agentTask?.status === 'done' ? '#10b981' : agentTask?.status === 'in-progress' ? '#3b82f6' : '#6b7280',
                      color: '#fff'
                    }}>
                      {agentTask?.status || 'backlog'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Linked Tasks */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Linked Tasks</h3>
          
          {linkedTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks linked yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {linkedTasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                    <span className={`status ${task.status}`} style={{ fontSize: 10 }}>{task.status}</span>
                  </div>
                  {task.agent && (
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: task.agent.avatar_color }}>
                      {task.agent.name?.[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Task */}
          <select
            className="form-select"
            style={{ marginTop: 12 }}
            onChange={(e) => {
              if (e.target.value) {
                linkTask(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="">+ Link a task</option>
            {availableTasks
              .filter(t => !linkedTaskIds.includes(t.id))
              .map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Notes</h3>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
            />
            <button className="btn btn-primary" onClick={addNote}>Add</button>
          </div>

          {notes.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notes yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflow: 'auto' }}>
              {notes.map((note) => (
                <div key={note.id} style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                  <div style={{ fontSize: 13 }}>{note.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {note.created_by} • {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
