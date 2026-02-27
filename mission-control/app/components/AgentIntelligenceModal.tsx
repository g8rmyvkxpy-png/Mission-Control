'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  goal: string;
  about: string;
  skills: string[];
  soul: string;
  group: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  completedAt?: number;
  error?: string;
}

interface AgentIntelligenceModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  theme: {
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}

export default function AgentIntelligenceModal({ agent, isOpen, onClose, theme }: AgentIntelligenceModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isOpen && agent?.id) {
      fetchAgentHistory();
    }
  }, [isOpen, agent?.id]);

  const fetchAgentHistory = async () => {
    try {
      const res = await fetch(`/api/agents/${agent.id}/history`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch agent history:', error);
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskTitle.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          assignedTo: agent.id,
          priority: taskPriority,
        }),
      });
      
      if (res.ok) {
        setToastMessage(`✅ Assigned to ${agent.name}`);
        setShowToast(true);
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('medium');
        
        setTimeout(() => setShowToast(false), 3000);
        fetchAgentHistory();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
    setLoading(false);
  };

  if (!isOpen || !agent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'processing': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'processing': return '⚙️';
      default: return '⏳';
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '12px 20px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease',
        }}>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div 
          style={{
            background: theme.surface,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '520px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '48px', 
              width: '72px', 
              height: '72px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: `${agent.color}20`, 
              borderRadius: '16px' 
            }}>
              {agent.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, margin: 0 }}>{agent.name}</h2>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>{agent.role}</div>
              <div style={{ fontSize: '13px', color: agent.color, marginTop: '2px' }}>{agent.specialty}</div>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '24px', 
                cursor: 'pointer', 
                color: theme.textSecondary 
              }}
            >
              ×
            </button>
          </div>

          {/* About */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About</div>
            <div style={{ fontSize: '14px', color: theme.text, lineHeight: '1.5' }}>{agent.about}</div>
          </div>

          {/* Soul */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soul</div>
            <div style={{ fontSize: '13px', color: theme.text, fontStyle: 'italic', fontFamily: 'Georgia, serif', padding: '12px', background: theme.background, borderRadius: '8px' }}>"{agent.soul}"</div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {agent.skills.map((skill: string) => (
                <span key={skill} style={{ 
                  fontSize: '12px', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  background: theme.background, 
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Activity</div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.length > 0 ? (
                tasks.slice(0, 5).map((task) => (
                  <div key={task.id} style={{ 
                    padding: '10px', 
                    background: theme.background, 
                    borderRadius: '6px', 
                    border: `1px solid ${theme.border}` 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px' }}>{getStatusIcon(task.status)}</span>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: theme.text, flex: 1 }}>{task.title}</span>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: task.priority === 'high' ? '#ef444420' : task.priority === 'medium' ? '#f59e0b20' : '#22c55e20',
                        color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: theme.textSecondary, marginLeft: '20px' }}>
                      {task.status === 'completed' 
                        ? `✓ Completed ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}`
                        : task.status === 'failed'
                        ? `❌ ${task.error?.slice(0, 30) || 'Failed'}`
                        : `${task.status} • ${new Date(task.createdAt).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: theme.textSecondary, textAlign: 'center', padding: '16px', background: theme.background, borderRadius: '6px' }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Quick Task Input */}
          <div style={{ padding: '16px', background: theme.background, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Task for {agent.name}
            </div>
            <input 
              type="text" 
              placeholder="Task title..." 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginBottom: '8px', 
                background: theme.surface, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '6px', 
                color: theme.text, 
                fontSize: '12px' 
              }}
            />
            <textarea 
              placeholder="Description (optional)..." 
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginBottom: '8px', 
                background: theme.surface, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '6px', 
                color: theme.text, 
                fontSize: '12px', 
                minHeight: '50px', 
                resize: 'vertical' 
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  background: theme.surface, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '6px', 
                  color: theme.text, 
                  fontSize: '12px' 
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button 
                onClick={handleTaskSubmit}
                disabled={!taskTitle.trim() || loading}
                style={{ 
                  padding: '8px 16px', 
                  background: theme.accent, 
                  border: 'none', 
                  borderRadius: '6px', 
                  color: '#fff', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  cursor: taskTitle.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity: taskTitle.trim() && !loading ? 1 : 0.5 
                }}
              >
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
