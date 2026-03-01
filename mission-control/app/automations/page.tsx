'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  runs: number;
}

const defaultAutomations: Automation[] = [
  { id: '1', name: 'Daily Brief', description: 'Send morning briefing at 8 AM', trigger: 'Schedule (8 AM)', action: 'Send message', status: 'active', lastRun: '2 hours ago', runs: 45 },
  { id: '2', name: 'Lead Follow-up', description: 'Follow up with leads after 3 days', trigger: 'Time-based (3 days)', action: 'Send email', status: 'active', lastRun: '1 day ago', runs: 128 },
  { id: '3', name: 'Content Scheduler', description: 'Publish content on schedule', trigger: 'Schedule', action: 'Publish to platform', status: 'active', lastRun: '5 hours ago', runs: 67 },
  { id: '4', name: 'Task Alert', description: 'Alert on high priority tasks', trigger: 'Task created', action: 'Send notification', status: 'paused', lastRun: '3 days ago', runs: 23 },
  { id: '5', name: 'Weekly Report', description: 'Generate weekly analytics report', trigger: 'Schedule (Sunday)', action: 'Generate & send report', status: 'active', lastRun: '2 days ago', runs: 12 }
];

export const dynamic = 'force-dynamic';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(defaultAutomations);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  const filtered = filter === 'all' ? automations : automations.filter(a => a.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#3fb950',
      paused: '#d29922',
      error: '#f85149'
    };
    return colors[status] || '#8b949e';
  };

  const toggleStatus = (id: string) => {
    setAutomations(automations.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'active' ? 'paused' : 'active' };
      }
      return a;
    }));
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Automations</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Automations ⚡</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Workflow automation rules ({automations.length} rules)</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>Total</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>{automations.length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#3fb950', margin: 0}}>Active</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{automations.filter(a => a.status === 'active').length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#d29922', margin: 0}}>Paused</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0', color: '#d29922'}}>{automations.filter(a => a.status === 'paused').length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>Total Runs</p>
            <p style={{fontSize: 28, fontWeight: 700, margin: '8px 0 0'}}>{automations.reduce((sum, a) => sum + a.runs, 0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{display: 'flex', gap: 8, marginBottom: 24}}>
          {(['all', 'active', 'paused'] as const).map(status => (
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
                textTransform: 'capitalize'
              }}
            >
              {status} ({status === 'all' ? automations.length : automations.filter(a => a.status === status).length})
            </button>
          ))}
        </div>

        {/* Automations List */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {filtered.map(automation => (
            <div key={automation.id} className="card" style={{padding: 20}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}>
                    <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{automation.name}</h3>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      background: `${getStatusColor(automation.status)}20`,
                      color: getStatusColor(automation.status),
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {automation.status}
                    </span>
                  </div>
                  <p style={{margin: 0, color: '#8b949e', fontSize: 14}}>{automation.description}</p>
                  <div style={{display: 'flex', gap: 24, marginTop: 12}}>
                    <div>
                      <span style={{fontSize: 11, color: '#8b949e', textTransform: 'uppercase'}}>Trigger</span>
                      <p style={{margin: '2px 0 0', fontSize: 13}}>{automation.trigger}</p>
                    </div>
                    <div>
                      <span style={{fontSize: 11, color: '#8b949e', textTransform: 'uppercase'}}>Action</span>
                      <p style={{margin: '2px 0 0', fontSize: 13}}>{automation.action}</p>
                    </div>
                    <div>
                      <span style={{fontSize: 11, color: '#8b949e', textTransform: 'uppercase'}}>Last Run</span>
                      <p style={{margin: '2px 0 0', fontSize: 13}}>{automation.lastRun}</p>
                    </div>
                    <div>
                      <span style={{fontSize: 11, color: '#8b949e', textTransform: 'uppercase'}}>Runs</span>
                      <p style={{margin: '2px 0 0', fontSize: 13}}>{automation.runs}</p>
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: 8}}>
                  <button 
                    onClick={() => toggleStatus(automation.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: automation.status === 'active' ? '#d29922' : '#3fb950',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 13
                    }}
                  >
                    {automation.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card" style={{padding: 40, textAlign: 'center'}}>
            <p style={{color: '#8b949e'}}>No automations found</p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/automations" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>⚡</span><span style={{fontSize: 10}}>Auto</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
