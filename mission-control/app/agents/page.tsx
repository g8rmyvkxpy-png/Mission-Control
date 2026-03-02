'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  color: string;
  status: string;
  tools: string[];
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>AI Agents 🤖</h1>
        <p style={{ color: '#8b949e', fontSize: 16, margin: 0 }}>Your AI workforce</p>
      </div>

      {loading ? (
        <p style={{ color: '#8b949e' }}>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          {agents.map((agent) => (
            <div key={agent.id} style={{ padding: 24, background: '#0f1117', borderRadius: 12, border: '1px solid #21262d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 40 }}>{agent.avatar}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 18, margin: 0 }}>{agent.name}</p>
                  <p style={{ color: '#8b949e', fontSize: 13, margin: '4px 0 0' }}>{agent.role}</p>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: agent.status === 'active' ? 'rgba(63,185,80,0.15)' : 'rgba(110,118,128,0.15)', color: agent.status === 'active' ? '#3fb950' : '#8b949e' }}>
                  {agent.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#8b949e' }}>
                <span>📋 {agent.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={{ width: 'auto', padding: '14px 32px', background: '#2f81f7', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        + Deploy New Agent
      </button>
    </div>
  );
}
