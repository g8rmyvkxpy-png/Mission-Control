'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tasks: number;
  completedTasks: number;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'PP Ventures Website', description: 'Main venture website with AI agent services', status: 'completed', progress: 100, priority: 'high', dueDate: '2026-02-25', tasks: 12, completedTasks: 12 },
  { id: '2', name: 'Mission Control v2', description: 'Next gen AI workforce command center', status: 'in_progress', progress: 65, priority: 'high', dueDate: '2026-03-15', tasks: 20, completedTasks: 13 },
  { id: '3', name: 'Content Pipeline', description: 'Automated content creation and distribution', status: 'in_progress', progress: 40, priority: 'medium', dueDate: '2026-03-30', tasks: 8, completedTasks: 3 },
  { id: '4', name: 'Agent Marketplace', description: 'Pre-built agent templates for quick deploy', status: 'planning', progress: 10, priority: 'medium', dueDate: '2026-04-15', tasks: 5, completedTasks: 0 },
  { id: '5', name: 'Analytics Dashboard', description: 'Advanced analytics and ROI tracking', status: 'on_hold', progress: 30, priority: 'low', dueDate: '2026-04-30', tasks: 6, completedTasks: 2 }
];

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [filter, setFilter] = useState<'all' | 'planning' | 'in_progress' | 'completed' | 'on_hold'>('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: '#8b949e',
      in_progress: '#2f81f7',
      completed: '#3fb950',
      on_hold: '#d29922'
    };
    return colors[status] || '#8b949e';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#8b949e',
      medium: '#d29922',
      high: '#f85149'
    };
    return colors[priority] || '#8b949e';
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Projects</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Projects 📁</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Track your initiatives ({projects.length} projects)</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>Total</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>{projects.length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#2f81f7', margin: 0}}>In Progress</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#2f81f7'}}>{projects.filter(p => p.status === 'in_progress').length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#3fb950', margin: 0}}>Completed</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{projects.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#d29922', margin: 0}}>On Hold</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#d29922'}}>{projects.filter(p => p.status === 'on_hold').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap'}}>
          {(['all', 'planning', 'in_progress', 'completed', 'on_hold'] as const).map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: filter === status ? '#2f81f7' : '#21262d',
                color: filter === status ? '#fff' : '#8b949e',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
                textTransform: 'capitalize'
              }}
            >
              {status.replace('_', ' ')} ({status === 'all' ? projects.length : projects.filter(p => p.status === status).length})
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16}}>
          {filtered.map(project => (
            <div key={project.id} className="card" style={{padding: 24}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
                <div>
                  <h3 style={{margin: 0, fontSize: 18, fontWeight: 600}}>{project.name}</h3>
                  <p style={{margin: '4px 0 0', color: '#8b949e', fontSize: 13}}>{project.description}</p>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${getStatusColor(project.status)}20`,
                  color: getStatusColor(project.status),
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{marginTop: 16}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                  <span style={{fontSize: 12, color: '#8b949e'}}>Progress</span>
                  <span style={{fontSize: 12, fontWeight: 600}}>{project.progress}%</span>
                </div>
                <div style={{height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden'}}>
                  <div style={{
                    height: '100%',
                    width: `${project.progress}%`,
                    background: project.progress === 100 ? '#3fb950' : '#2f81f7',
                    borderRadius: 3,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>

              {/* Meta */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #21262d'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div>
                    <span style={{fontSize: 10, color: '#8b949e', textTransform: 'uppercase'}}>Tasks</span>
                    <p style={{margin: '2px 0 0', fontSize: 13}}>{project.completedTasks}/{project.tasks}</p>
                  </div>
                  <div>
                    <span style={{fontSize: 10, color: '#8b949e', textTransform: 'uppercase'}}>Due</span>
                    <p style={{margin: '2px 0 0', fontSize: 13}}>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: `${getPriorityColor(project.priority)}20`,
                  color: getPriorityColor(project.priority),
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {project.priority}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card" style={{padding: 40, textAlign: 'center'}}>
            <p style={{color: '#8b949e'}}>No projects found</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/projects" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>📁</span><span style={{fontSize: 10}}>Projects</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
