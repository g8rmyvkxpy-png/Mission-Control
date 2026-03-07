'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [mission, setMission] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMission, setEditingMission] = useState(false);
  const [missionText, setMissionText] = useState('');
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [editingPersonality, setEditingPersonality] = useState(null);
  const [personalityForm, setPersonalityForm] = useState({});
  const router = useRouter();

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
    setMissionText(missionData.mission?.content || '');
    setAgents(agentsData.agents || []);
    setLoading(false);
  }

  async function saveMission() {
    await fetch('/api/mission', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: missionText })
    });
    setEditingMission(false);
    fetchData();
  }

  async function savePersonality(agentId) {
    await fetch(`/api/agents/${agentId}/personality`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personalityForm)
    });
    setEditingPersonality(null);
    fetchData();
  }

  function getStatusColor(status) {
    switch (status) {
      case 'online': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#888';
    }
  }

  function getTypeColor(type) {
    switch (type) {
      case 'human': return '#f59e0b';
      case 'agent': return '#10b981';
      case 'subagent': return '#3b82f6';
      default: return '#888';
    }
  }

  // Build hierarchy
  const hierarchy = useMemo(() => {
    const root = team.filter(t => !t.reports_to);
    return root.map(r => ({
      ...r,
      reports: team.filter(t => t.reports_to === r.id)
    }));
  }, [team]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      {/* Mission Statement */}
      <div className="card" style={{ marginBottom: 24, padding: 24, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h2 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent-green)' }}>Mission</h2>
          <button className="btn btn-sm" onClick={() => editingMission ? saveMission() : setEditingMission(true)}>
            {editingMission ? '💾 Save' : '✏️ Edit'}
          </button>
        </div>
        
        {editingMission ? (
          <textarea
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              color: 'var(--text-primary)',
              fontSize: 18,
              fontWeight: 600,
              minHeight: 80,
              resize: 'vertical'
            }}
          />
        ) : (
          <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{mission?.content}</p>
        )}
      </div>

      {/* Org Chart */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Organization</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {hierarchy.map((member) => (
            <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <OrgNode member={member} getStatusColor={getStatusColor} getTypeColor={getTypeColor} />
              
              {member.reports && member.reports.length > 0 && (
                <>
                  <div style={{ width: 2, height: 20, background: 'var(--border)' }} />
                  <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '50%', right: '50%', height: 2, background: 'var(--border)', transform: 'translateY(-50%)' }} />
                    {member.reports.map((report, i) => (
                      <div key={report.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 2, height: 20, background: 'var(--border)' }} />
                        <OrgNode member={report} getStatusColor={getStatusColor} getTypeColor={getTypeColor} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Cards with Personality */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>All Team Members</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Member
        </button>
      </div>

      <div className="grid grid-3">
        {team.map((member) => (
          <div key={member.id} className="card" style={{ cursor: 'pointer' }} onClick={() => member.agent_id && router.push(`/dashboard/agent/${member.agent_id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="avatar" style={{ background: member.avatar_color, width: 40, height: 40, fontSize: 16 }}>
                {member.name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{member.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{member.role}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: getTypeColor(member.type) + '20', color: getTypeColor(member.type) }}>
                {member.type}
              </span>
              <span style={{ 
                fontSize: 10, padding: '2px 8px', borderRadius: 4, 
                background: getStatusColor(member.status) + '20', color: getStatusColor(member.status),
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(member.status) }} />
                {member.status}
              </span>
            </div>
            
            {/* Show personality for agents */}
            {member.agent_id && (
              <div 
                style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedAgent(expandedAgent === member.id ? null : member.id);
                }}
              >
                {agents.find(a => a.id === member.agent_id)?.catchphrase && (
                  <div style={{ fontSize: 12, fontStyle: 'italic', color: '#888', marginBottom: 8 }}>
                    "{agents.find(a => a.id === member.agent_id)?.catchphrase}"
                  </div>
                )}
                {agents.find(a => a.id === member.agent_id)?.specialisation && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {agents.find(a => a.id === member.agent_id)?.specialisation.split(',').slice(0, 3).map((spec, i) => (
                      <span key={i} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        {spec.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Expanded personality view */}
                {expandedAgent === member.id && (
                  <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                    {editingPersonality === member.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Catchphrase"
                          value={personalityForm.catchphrase || ''}
                          onChange={(e) => setPersonalityForm({ ...personalityForm, catchphrase: e.target.value })}
                          style={{ fontSize: 12 }}
                        />
                        <textarea
                          className="form-textarea"
                          placeholder="Personality"
                          value={personalityForm.personality || ''}
                          onChange={(e) => setPersonalityForm({ ...personalityForm, personality: e.target.value })}
                          rows={2}
                          style={{ fontSize: 11 }}
                        />
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => savePersonality(member.agent_id)}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button 
                          className="btn btn-sm" 
                          style={{ marginBottom: 8 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const agent = agents.find(a => a.id === member.agent_id);
                            setPersonalityForm({
                              personality: agent?.personality || '',
                              tone: agent?.tone || '',
                              specialisation: agent?.specialisation || '',
                              backstory: agent?.backstory || '',
                              catchphrase: agent?.catchphrase || '',
                              working_style: agent?.working_style || ''
                            });
                            setEditingPersonality(member.id);
                          }}
                        >
                          ✏️ Edit Personality
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {member.model && <div>Model: {member.model}</div>}
              {member.device && <div>Device: {member.device}</div>}
            </div>
            
            {member.description && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddMemberModal
          team={team}
          agents={agents}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function OrgNode({ member, getStatusColor, getTypeColor }) {
  const router = useRouter();
  
  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        minWidth: 120,
        cursor: member.agent_id ? 'pointer' : 'default'
      }}
      onClick={() => member.agent_id && router.push(`/dashboard/agent/${member.agent_id}`)}
    >
      <div className="avatar" style={{ 
        background: member.avatar_color, 
        width: 48, 
        height: 48, 
        fontSize: 20,
        marginBottom: 8
      }}>
        {member.name?.[0]}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, textAlign: 'center' }}>{member.name}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>{member.role}</div>
      <span style={{ 
        fontSize: 10, padding: '2px 6px', borderRadius: 4, marginTop: 4,
        background: getStatusColor(member.status) + '20', color: getStatusColor(member.status)
      }}>
        {member.status}
      </span>
    </div>
  );
}

function AddMemberModal({ team, agents, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('agent');
  const [model, setModel] = useState('');
  const [device, setDevice] = useState('');
  const [description, setDescription] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, role, type, model, device, description,
        reports_to: reportsTo || null,
        agent_id: agentId || null
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
          <h2 className="modal-title">Add Team Member</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="human">Human</option>
                <option value="agent">Agent</option>
                <option value="subagent">Subagent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input type="text" className="form-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Minimax" />
            </div>

            <div className="form-group">
              <label className="form-label">Device</label>
              <input type="text" className="form-input" value={device} onChange={(e) => setDevice(e.target.value)} placeholder="e.g. Server" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reports To</label>
            <select className="form-select" value={reportsTo} onChange={(e) => setReportsTo(e.target.value)}>
              <option value="">No one (top level)</option>
              {team.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Link to Agent</label>
            <select className="form-select" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">None</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
