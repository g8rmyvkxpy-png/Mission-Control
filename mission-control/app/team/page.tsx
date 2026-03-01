'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  status: string;
  goal?: string;
  about?: string;
  skills?: string[];
  soul?: string;
  group: string;
}

const groups = [
  { id: 'sales', label: '💰 Sales', color: '#3fb950' },
  { id: 'research', label: '🔬 Research', color: '#2f81f7' },
  { id: 'dev', label: '⚙️ Dev', color: '#a371f7' },
  { id: 'content', label: '✍️ Content', color: '#f59e0b' },
  { id: 'retention', label: '💎 Retention', color: '#ec4899' }
];

const defaultAgents: Agent[] = [
  // Sales
  { id: 'scout', name: 'Scout', role: 'Lead Researcher', specialty: 'Find prospects', avatar: '🔍', color: '#14b8a6', status: 'idle', goal: 'Leads', about: 'Finds and qualifies potential customers.', skills: ['Web Search', 'Data Scraping'], group: 'sales' },
  { id: 'closer', name: 'Closer', role: 'Sales Rep', specialty: 'Close deals', avatar: '🤝', color: '#10b981', status: 'idle', goal: 'Revenue', about: 'Handles negotiations and closes deals.', skills: ['Negotiation', 'CRM'], group: 'sales' },
  { id: 'outreach', name: 'Outreach', role: 'SDR', specialty: 'Cold outreach', avatar: '📧', color: '#06b6d4', status: 'idle', goal: 'Connections', about: 'Sends personalized cold emails.', skills: ['Email', 'Copywriting'], group: 'sales' },
  // Research
  { id: 'spark', name: 'Spark', role: 'Researcher', specialty: 'Deep dive', avatar: '💡', color: '#f59e0b', status: 'idle', goal: 'Insights', about: 'Researches topics deeply.', skills: ['Analysis', 'Web Search'], group: 'research' },
  { id: 'trend', name: 'Trend', role: 'Analyst', specialty: 'Track trends', avatar: '📈', color: '#ef4444', status: 'idle', goal: 'Trends', about: 'Monitors industry trends.', skills: ['Analytics', 'Reporting'], group: 'research' },
  // Dev
  { id: 'builder', name: 'Builder', role: 'Engineer', specialty: 'Build features', avatar: '🔨', color: '#8b5cf6', status: 'idle', goal: 'Features', about: 'Builds and ships features.', skills: ['Coding', 'Debugging'], group: 'dev' },
  { id: 'review', name: 'Review', role: 'Code Reviewer', specialty: 'Quality', avatar: '👀', color: '#6366f1', status: 'idle', goal: 'Quality', about: 'Reviews code for quality.', skills: ['Code Review', 'Testing'], group: 'dev' },
  // Content
  { id: 'ink', name: 'Ink', role: 'Writer', specialty: 'Blogs', avatar: '✍️', color: '#f59e0b', status: 'idle', goal: 'Content', about: 'Writes blog posts.', skills: ['Blog Writing'], group: 'content' },
  { id: 'blaze', name: 'Blaze', role: 'Social', specialty: 'Twitter', avatar: '📱', color: '#ef4444', status: 'idle', goal: 'Presence', about: 'Manages social media.', skills: ['Twitter'], group: 'content' },
  { id: 'cinema', name: 'Cinema', role: 'Video', specialty: 'YouTube', avatar: '🎬', color: '#06b6d4', status: 'idle', goal: 'Videos', about: 'Creates videos.', skills: ['Video Editing'], group: 'content' },
  { id: 'draft', name: 'Draft', role: 'Email', specialty: 'Newsletters', avatar: '📧', color: '#a855f7', status: 'idle', goal: 'Nurture', about: 'Writes email campaigns.', skills: ['Email Writing'], group: 'content' },
  // Retention
  { id: 'charm', name: 'Charm', role: 'Success', specialty: 'Onboarding', avatar: '🎁', color: '#ec4899', status: 'idle', goal: 'Delight', about: 'Onboards new customers.', skills: ['Onboarding', 'Support'], group: 'retention' },
  { id: 'solve', name: 'Solve', role: 'Support', specialty: 'Resolve issues', avatar: '🛠️', color: '#14b8a6', status: 'idle', goal: 'Resolution', about: 'Resolves customer issues.', skills: ['Troubleshooting'], group: 'retention' }
];

export const dynamic = 'force-dynamic';

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from API, fallback to default
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents.map((a: any) => ({
            ...a,
            group: groups[Math.floor(Math.random() * groups.length)].id
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredAgents = selectedGroup === 'all' 
    ? agents 
    : agents.filter(a => a.group === selectedGroup);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#3fb950',
      busy: '#d29922',
      idle: '#8b949e',
      offline: '#6e7681'
    };
    return colors[status] || '#8b949e';
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Team</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Team 🤖</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Your AI workforce ({agents.length} agents)</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Group Filters */}
        <div style={{display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap'}}>
          <button 
            onClick={() => setSelectedGroup('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: selectedGroup === 'all' ? '#2f81f7' : '#21262d',
              color: selectedGroup === 'all' ? '#fff' : '#8b949e',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            All ({agents.length})
          </button>
          {groups.map(group => (
            <button 
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: selectedGroup === group.id ? group.color : '#21262d',
                color: selectedGroup === group.id ? '#fff' : '#8b949e',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {group.label} ({agents.filter(a => a.group === group.id).length})
            </button>
          ))}
        </div>

        {/* Agents Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
          {filteredAgents.map(agent => (
            <div 
              key={agent.id}
              className="card"
              style={{
                padding: 20,
                cursor: 'pointer',
                border: selectedAgent?.id === agent.id ? `2px solid ${agent.color}` : '2px solid transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => setSelectedAgent(agent)}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `${agent.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}>
                  {agent.avatar}
                </div>
                <div>
                  <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{agent.name}</h3>
                  <p style={{margin: 0, fontSize: 12, color: '#8b949e'}}>{agent.role}</p>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{fontSize: 12, color: '#8b949e'}}>{agent.specialty}</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: `${getStatusColor(agent.status)}20`,
                  color: getStatusColor(agent.status),
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  <span style={{width: 6, height: 6, borderRadius: '50%', background: getStatusColor(agent.status)}} />
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24
          }} onClick={() => setSelectedAgent(null)}>
            <div className="card" style={{maxWidth: 500, width: '100%', maxHeight: '80vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `${selectedAgent.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32
                  }}>
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <h2 style={{margin: 0, fontSize: 24}}>{selectedAgent.name}</h2>
                    <p style={{margin: '4px 0 0', color: '#8b949e'}}>{selectedAgent.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} style={{background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20}}>✕</button>
              </div>
              
              <div style={{marginBottom: 16}}>
                <span style={{fontSize: 12, color: '#8b949e', textTransform: 'uppercase'}}>About</span>
                <p style={{margin: '4px 0 0'}}>{selectedAgent.about || 'No description available.'}</p>
              </div>
              
              <div style={{marginBottom: 16}}>
                <span style={{fontSize: 12, color: '#8b949e', textTransform: 'uppercase'}}>Specialty</span>
                <p style={{margin: '4px 0 0'}}>{selectedAgent.specialty}</p>
              </div>
              
              <div style={{marginBottom: 16}}>
                <span style={{fontSize: 12, color: '#8b949e', textTransform: 'uppercase'}}>Skills</span>
                <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>
                  {(selectedAgent.skills || ['General']).map((skill, i) => (
                    <span key={i} style={{padding: '4px 12px', background: '#21262d', borderRadius: 12, fontSize: 13}}>{skill}</span>
                  ))}
                </div>
              </div>
              
              <div style={{marginBottom: 16}}>
                <span style={{fontSize: 12, color: '#8b949e', textTransform: 'uppercase'}}>Goal</span>
                <p style={{margin: '4px 0 0', color: selectedAgent.color}}>{selectedAgent.goal || 'N/A'}</p>
              </div>

              <button style={{width: '100%', padding: '14px', background: selectedAgent.color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'}}>
                Assign Task to {selectedAgent.name}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/team" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Team</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
