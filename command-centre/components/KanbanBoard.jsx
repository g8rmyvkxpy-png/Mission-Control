'use client';

import { useState } from 'react';

const columns = [
  { id: 'backlog', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

export default function KanbanBoard({ tasks, agents, onStatusChange, onApprove }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAllDone, setShowAllDone] = useState(false);
  const [doneCollapsed, setDoneCollapsed] = useState(false);

  const DONE_DISPLAY_LIMIT = 10;

  function getTasksByStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  function handleDragStart(task) {
    setDraggedTask(task);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(status) {
    if (draggedTask && draggedTask.status !== status) {
      onStatusChange(draggedTask.id, status);
    }
    setDraggedTask(null);
  }

  function handleTaskClick(task) {
    setSelectedTask(task);
  }

  return (
    <>
      <div className="kanban-board">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="kanban-header">
                <span className="kanban-title">{column.label}</span>
                <span className="kanban-count">{columnTasks.length}</span>
                {column.id === 'done' && columnTasks.length > DONE_DISPLAY_LIMIT && (
                  <button
                    onClick={() => setDoneCollapsed(!doneCollapsed)}
                    style={{
                      marginLeft: 8,
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: 10,
                    }}
                  >
                    {doneCollapsed ? '▼ Expand' : '▲ Collapse'}
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {columnTasks
                  .slice(0, column.id === 'done' && !showAllDone && !doneCollapsed ? DONE_DISPLAY_LIMIT : undefined)
                  .map((task) => (
                  <div
                    key={task.id}
                    className="kanban-task"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleTaskClick(task)}
                    style={{ opacity: draggedTask?.id === task.id ? 0.5 : 1, cursor: 'pointer' }}
                  >
                    <div className="kanban-task-title">{task.title}</div>
                    
                    <div className="kanban-task-meta">
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.created_by === 'subtask' && (
                        <span style={{ fontSize: 10, color: '#8b5cf6' }} title="Subtask">🔗</span>
                      )}
                      
                      {task.agent && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div
                            className="avatar"
                            style={{
                              width: 16,
                              height: 16,
                              fontSize: 8,
                              background: task.agent.avatar_color || '#10b981',
                            }}
                          >
                            {task.agent.name?.[0]}
                          </div>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          marginTop: 8,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.description}
                      </div>
                    )}
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 20,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    No tasks
                  </div>
                )}

                {/* Show more button for DONE column */}
                {column.id === 'done' && columnTasks.length > DONE_DISPLAY_LIMIT && !doneCollapsed && !showAllDone && (
                  <button
                    onClick={() => setShowAllDone(true)}
                    style={{
                      width: '100%',
                      padding: 8,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px dashed #10b981',
                      borderRadius: 6,
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: 11,
                      marginTop: 8,
                    }}
                  >
                    Show {columnTasks.length - DONE_DISPLAY_LIMIT} more...
                  </button>
                )}

                {/* Show less button */}
                {column.id === 'done' && showAllDone && (
                  <button
                    onClick={() => setShowAllDone(false)}
                    style={{
                      width: '100%',
                      padding: 8,
                      background: 'none',
                      border: '1px solid #30363d',
                      borderRadius: 6,
                      color: '#8b949e',
                      cursor: 'pointer',
                      fontSize: 11,
                      marginTop: 8,
                    }}
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 className="modal-title">Task Details</h2>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{selectedTask.title}</div>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className={`status ${selectedTask.status}`}>
                  <span className="status-dot" />
                  {selectedTask.status}
                </span>
                <span className={`priority ${selectedTask.priority}`}>
                  {selectedTask.priority}
                </span>
              </div>

              {selectedTask.agent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div
                    className="avatar"
                    style={{
                      width: 24,
                      height: 24,
                      fontSize: 12,
                      background: selectedTask.agent.avatar_color || '#10b981',
                    }}
                  >
                    {selectedTask.agent.name?.[0]}
                  </div>
                  <span>{selectedTask.agent.name}</span>
                </div>
              )}

              {selectedTask.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Description</div>
                  <div style={{ color: 'var(--text-primary)' }}>{selectedTask.description}</div>
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Result</div>
                {selectedTask.result ? (
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    padding: 12, 
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    fontSize: 13,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {selectedTask.result}
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent-yellow)', fontStyle: 'italic' }}>
                    Agent is still working...
                  </div>
                )}
              </div>

              {/* Stale task warning */}
              {selectedTask.status === 'in-progress' && selectedTask.updated_at && (() => {
                const staleMs = 60 * 60 * 1000;
                const lastUpdate = new Date(selectedTask.updated_at).getTime();
                const isStale = Date.now() - lastUpdate > staleMs;
                const hoursStale = Math.round((Date.now() - lastUpdate) / (1000 * 60 * 60));
                
                return isStale ? (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 10, 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    border: '1px solid #ef4444',
                    borderRadius: 6,
                    color: '#ef4444',
                    fontSize: 12
                  }}>
                    ⚠️ Task stale ({hoursStale}h). 
                    <button 
                      onClick={async () => {
                        await fetch(`/api/tasks?id=${selectedTask.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'backlog' })
                        });
                        setSelectedTask(null);
                        if (typeof window !== 'undefined') window.location.reload();
                      }}
                      style={{ 
                        marginLeft: 8, 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      Reassign
                    </button>
                  </div>
                ) : null;
              })()}

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                Created: {new Date(selectedTask.created_at).toLocaleString()}
                {selectedTask.updated_at && (
                  <> • Updated: {new Date(selectedTask.updated_at).toLocaleString()}</>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn" 
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
                    await fetch(`/api/tasks?id=${selectedTask.id}`, { method: 'DELETE' });
                    setSelectedTask(null);
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }
                }}
              >
                Delete Task
              </button>
              <button className="btn" onClick={() => setSelectedTask(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
