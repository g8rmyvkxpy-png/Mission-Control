'use client';

import { useState, useEffect, useMemo } from 'react';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [mission, setMission] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [agentStats, setAgentStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [teamRes, missionRes, agentsRes] = await Promise.all([
      fetch('/api/team'),
      fetch('/api/mission'),
      fetch('/api/agents')
    ]);
    
    const teamData = await teamRes.json();
    const missionData = await missionRes.json();
    const agentsData = await agentsRes.json();
    
    setTeam(teamData.team || []);
    setMission(missionData.mission);
    setAgents(agentsData.agents || []);
    
    // Fetch stats for each agent
    const stats = {};
    for (const agent of agentsData.agents || []) {
      try {
        const tasksRes = await fetch(`/api/agents/${agent.id}/tasks`);
        const tasksData = await tasksRes.json();
        stats[agent.id] = {
          tasks: tasksData.tasks?.length || 0,
          done: tasksData.tasks?.filter(t => t.status === 'done').length || 0
        };
      } catch {
        stats[agent.id] = { tasks: 0, done: 0 };
      }
    }
    setAgentStats(stats);
    setLoading(false);
  }

  function getStatusColor(status) {
    switch (status) {
      case 'online': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#888';
    }
  }

  function getAgentColor(name) {
    switch (name) {
      case 'Neo': return '#10b981';
      case 'Atlas': return '#58a6ff';
      case 'Orbit': return '#f0883e';
      default: return '#888';
    }
  }

  const neo = agents.find(a => a.name === 'Neo');
  const atlas = agents.find(a => a.name === 'Atlas');
  const orbit = agents.find(a => a.name === 'Orbit');

  const neoStatus = neo?.status || 'idle';
  const atlasStatus = atlas?.status || 'idle';
  const orbitStatus = orbit?.status || 'idle';

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--text-primary)' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Team</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your AI team organization and personalities</p>
      </div>

      {/* Org Chart - Tree Structure */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>Organization</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* You - Founder */}
          <div style={{ 
            background: '#161b22', border: '2px solid #f0883e', borderRadius: 12, padding: '16px 24px',
            textAlign: 'center', minWidth: 120
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0883e', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#000', fontWeight: 'bold', fontSize: 18, margin: '0 auto 8px' }}>Y</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>You</div>
            <div style={{ color: '#8b949e', fontSize: 11 }}>Founder</div>
          </div>

          {/* Connector down */}
          <div style={{ width: 2, height: 24, background: '#30363d' }} />

          {/* Neo - CEO */}
          <div style={{ 
            background: '#161b22', border: '2px solid #10b981', borderRadius: 12, padding: '16px 24px',
            textAlign: 'center', minWidth: 120, cursor: 'pointer'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#10b981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: '#000', fontWeight: 'bold', fontSize: 18, margin: '0 auto 8px' }}>N</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Neo</div>
            <div style={{ color: '#8b949e', fontSize: 11 }}>CEO Agent</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(neoStatus) }} />
              <span style={{ fontSize: 10, color: getStatusColor(neoStatus) }}>{neoStatus}</span>
            </div>
          </div>

          {/* Connector that splits */}
          <div style={{ position: 'relative', width: 280, height: 24 }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: 12, background: '#30363d' }} />
            <div style={{ position: 'absolute', left: '25%', top: 12, width: '50%', height: 2, background: '#30363d' }} />
            <div style={{ position: 'absolute', left: '25%', top: 12, width: 2, height: 12, background: '#30363d' }} />
            <div style={{ position: 'absolute', right: '25%', top: 12, width: 2, height: 12, background: '#30363d' }} />
          </div>

          {/* Atlas and Orbit side by side */}
          <div style={{ display: 'flex', gap: 80 }}>
            {/* Atlas */}
            <div style={{ 
              background: '#161b22', border: '2px solid #58a6ff', borderRadius: 12, padding: '16px 24px',
              textAlign: 'center', minWidth: 120, cursor: 'pointer'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#58a6ff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#000', fontWeight: 'bold', fontSize: 18, margin: '0 auto 8px' }}>A</div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Atlas</div>
              <div style={{ color: '#8b949e', fontSize: 11 }}>Research</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(atlasStatus) }} />
                <span style={{ fontSize: 10, color: getStatusColor(atlasStatus) }}>{atlasStatus}</span>
              </div>
            </div>

            {/* Orbit */}
            <div style={{ 
              background: '#161b22', border: '2px solid #f0883e', borderRadius: 12, padding: '16px 24px',
              textAlign: 'center', minWidth: 120, cursor: 'pointer'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0883e', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#000', fontWeight: 'bold', fontSize: 18, margin: '0 auto 8px' }}>O</div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Orbit</div>
              <div style={{ color: '#8b949e', fontSize: 11 }}>Operations</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(orbitStatus) }} />
                <span style={{ fontSize: 10, color: getStatusColor(orbitStatus) }}>{orbitStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Personality Cards */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>Meet Your Team</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {/* Neo Card */}
          <div style={{ 
            background: '#161b22', border: '1px solid #30363d', 
            borderTop: '3px solid #10b981', borderRadius: 8, padding: 20 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#10b981', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#000', fontWeight: 'bold', fontSize: 18 }}>N</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Neo</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>CEO Agent</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(neoStatus) }} />
                <span style={{ fontSize: 11, color: getStatusColor(neoStatus) }}>{neoStatus}</span>
              </div>
            </div>

            <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Strategic leader. Reports only to Deva. Delegates to Atlas and Orbit.
              Direct, decisive, revenue-focused. Makes the calls.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#10b981', fontSize: 18, fontWeight: 'bold' }}>{agentStats[neo?.id]?.tasks || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Tasks</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#10b981', fontSize: 18, fontWeight: 'bold' }}>{agentStats[neo?.id]?.done || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Done</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#10b981', fontSize: 18, fontWeight: 'bold' }}>24/7</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Status</div>
              </div>
            </div>

            <button 
              onClick={() => { setEditModal('Neo'); setEditContent(neo?.personality || ''); }}
              style={{ width: '100%', background: '#21262d', border: '1px solid #30363d', 
                color: '#8b949e', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              ✏️ Edit Personality
            </button>
          </div>

          {/* Atlas Card */}
          <div style={{ 
            background: '#161b22', border: '1px solid #30363d', 
            borderTop: '3px solid #58a6ff', borderRadius: 8, padding: 20 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#58a6ff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#000', fontWeight: 'bold', fontSize: 18 }}>A</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Atlas</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>Research Agent</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(atlasStatus) }} />
                <span style={{ fontSize: 11, color: getStatusColor(atlasStatus) }}>{atlasStatus}</span>
              </div>
            </div>

            <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Research specialist. Finds information, analyzes data, creates reports.
              Curious, thorough, data-driven. Answers questions with depth.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#58a6ff', fontSize: 18, fontWeight: 'bold' }}>{agentStats[atlas?.id]?.tasks || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Tasks</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#58a6ff', fontSize: 18, fontWeight: 'bold' }}>{agentStats[atlas?.id]?.done || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Done</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#58a6ff', fontSize: 18, fontWeight: 'bold' }}>24/7</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Status</div>
              </div>
            </div>

            <button 
              onClick={() => { setEditModal('Atlas'); setEditContent(atlas?.personality || ''); }}
              style={{ width: '100%', background: '#21262d', border: '1px solid #30363d', 
                color: '#8b949e', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              ✏️ Edit Personality
            </button>
          </div>

          {/* Orbit Card */}
          <div style={{ 
            background: '#161b22', border: '1px solid #30363d', 
            borderTop: '3px solid #f0883e', borderRadius: 8, padding: 20 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0883e', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#000', fontWeight: 'bold', fontSize: 18 }}>O</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Orbit</div>
                <div style={{ color: '#8b949e', fontSize: 12 }}>Operations Agent</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(orbitStatus) }} />
                <span style={{ fontSize: 11, color: getStatusColor(orbitStatus) }}>{orbitStatus}</span>
              </div>
            </div>

            <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              Builder and operator. Implements changes, runs tasks, manages workflows.
              Gets things done. Execution-focused. Makes ideas reality.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#f0883e', fontSize: 18, fontWeight: 'bold' }}>{agentStats[orbit?.id]?.tasks || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Tasks</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#f0883e', fontSize: 18, fontWeight: 'bold' }}>{agentStats[orbit?.id]?.done || 0}</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Done</div>
              </div>
              <div style={{ textAlign: 'center', background: '#0d1117', borderRadius: 6, padding: 8 }}>
                <div style={{ color: '#f0883e', fontSize: 18, fontWeight: 'bold' }}>24/7</div>
                <div style={{ color: '#8b949e', fontSize: 10 }}>Status</div>
              </div>
            </div>

            <button 
              onClick={() => { setEditModal('Orbit'); setEditContent(orbit?.personality || ''); }}
              style={{ width: '100%', background: '#21262d', border: '1px solid #30363d', 
                color: '#8b949e', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              ✏️ Edit Personality
            </button>
          </div>
        </div>
      </div>

      {/* Edit Personality Modal */}
      {editModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div style={{ 
            background: '#161b22', border: '1px solid #30363d', 
            borderRadius: 12, padding: 24, width: 500, maxWidth: '90vw' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Edit {editModal} Personality</h3>
              <button 
                onClick={() => setEditModal(null)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 18 }}
              >✕</button>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ 
                width: '100%', height: 150, background: '#0d1117',
                border: '1px solid #30363d', borderRadius: 6, color: '#fff',
                padding: 12, fontSize: 13, resize: 'vertical', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setEditModal(null)}
                style={{ background: '#21262d', border: '1px solid #30363d',
                  color: '#8b949e', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { alert('Saved!'); setEditModal(null); }}
                style={{ background: '#238636', border: 'none',
                  color: '#fff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
