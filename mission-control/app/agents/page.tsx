'use client';

import { useState, useEffect } from 'react';
import { agentTemplates } from '../../config/agent-templates';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  status: string;
}

export default function AgentsPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeploy, setShowDeploy] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    // Get org from localStorage or URL
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org_id') || localStorage.getItem('mc_org_id');
    if (org) {
      setOrgId(org);
      fetchAgents(org);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAgents = async (orgId: string) => {
    try {
      const res = await fetch(`/api/agents?org_id=${orgId}`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const deployAgent = async (template: any) => {
    if (!orgId) {
      alert('No organization selected');
      return;
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          name: template.name,
          role: template.role,
          specialty: template.description,
          avatar: template.avatar,
          color: template.color,
          system_prompt: template.systemPrompt,
          tools: template.tools
        })
      });

      const data = await res.json();
      if (data.agent) {
        setAgents([...agents, data.agent]);
        setShowDeploy(false);
        setSelectedTemplate(null);
      }
    } catch (err) {
      console.error('Failed to deploy agent:', err);
    }
  };

  const toggleAgentStatus = async (agent: Agent) => {
    if (!orgId) return;
    
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    
    try {
      await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, status: newStatus })
      });
      
      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error('Failed to toggle agent:', err);
    }
  };

  if (!orgId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Organization Selected</h2>
        <p style={{ color: '#a1a1aa', marginTop: '12px' }}>
          Add ?org_id=YOUR_ORG_ID to the URL to view agents
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>🤖 AI Agents</h1>
          <p style={{ color: '#a1a1aa', marginTop: '4px' }}>
            Deploy and manage your AI workforce
          </p>
        </div>
        <button
          onClick={() => setShowDeploy(true)}
          style={{
            padding: '12px 24px',
            background: '#f97316',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Deploy Agent
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f97316' }}>{agents.length}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Agents</div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
            {agents.filter(a => a.status === 'active').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active</div>
        </div>
        <div style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#6366f1' }}>
            {agents.filter(a => a.status === 'inactive').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Inactive</div>
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading agents...</p>
      ) : agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ marginBottom: '8px' }}>No agents yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Deploy your first AI agent to get started</p>
          <button
            onClick={() => setShowDeploy(true)}
            style={{
              padding: '12px 24px',
              background: '#f97316',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Deploy Agent
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {agents.map(agent => (
            <div key={agent.id} style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{agent.avatar}</div>
                <div>
                  <div style={{ fontWeight: '600' }}>{agent.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{agent.role}</div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px' }}>{agent.specialty}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '4px 10px', 
                  borderRadius: '4px',
                  background: agent.status === 'active' ? '#22c55e20' : '#27272a',
                  color: agent.status === 'active' ? '#22c55e' : '#6b7280'
                }}>
                  {agent.status}
                </span>
                <button
                  onClick={() => toggleAgentStatus(agent)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #27272a',
                    borderRadius: '4px',
                    color: '#a1a1aa',
                    cursor: 'pointer'
                  }}
                >
                  {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deploy Modal */}
      {showDeploy && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setShowDeploy(false)}>
          <div style={{
            background: '#1a1a1d',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px' }}>Select Agent Template</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {agentTemplates.map(template => (
                <div 
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    padding: '20px',
                    background: selectedTemplate?.id === template.id ? '#f9731620' : '#27272a',
                    border: `1px solid ${selectedTemplate?.id === template.id ? '#f97316' : '#3f3f46'}`,
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{template.avatar}</span>
                    <div>
                      <div style={{ fontWeight: '600' }}>{template.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{template.role}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{template.description}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeploy(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#a1a1aa',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => selectedTemplate && deployAgent(selectedTemplate)}
                disabled={!selectedTemplate}
                style={{
                  padding: '12px 24px',
                  background: selectedTemplate ? '#f97316' : '#27272a',
                  border: 'none',
                  borderRadius: '8px',
                  color: selectedTemplate ? '#fff' : '#6b7280',
                  fontWeight: '600',
                  cursor: selectedTemplate ? 'pointer' : 'not-allowed'
                }}
              >
                Deploy Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
