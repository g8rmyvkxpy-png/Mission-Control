'use client';

import { useState, useEffect } from 'react';

interface AgentWork {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'working' | 'idle' | 'break' | 'thinking';
  currentTask: string;
  computerOn: boolean;
  location: { x: number; y: number };
}

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
}

const offices: AgentWork[] = [
  {
    id: 'neo',
    name: 'Neo',
    avatar: '🦅',
    color: '#f97316',
    status: 'working',
    currentTask: 'Coordinating team & planning',
    computerOn: true,
    location: { x: 2, y: 2 },
  },
  {
    id: 'developer',
    name: 'Dev Agent',
    avatar: '💻',
    color: '#3b82f6',
    status: 'idle',
    currentTask: 'Waiting for task',
    computerOn: true,
    location: { x: 1, y: 1 },
  },
  {
    id: 'researcher',
    name: 'Research Agent',
    avatar: '🔍',
    color: '#8b5cf6',
    status: 'thinking',
    currentTask: 'Analyzing information',
    computerOn: true,
    location: { x: 3, y: 1 },
  },
  {
    id: 'writer',
    name: 'Content Agent',
    avatar: '✍️',
    color: '#22c55e',
    status: 'idle',
    currentTask: 'Waiting for task',
    computerOn: true,
    location: { x: 1, y: 3 },
  },
  {
    id: 'analyst',
    name: 'Data Agent',
    avatar: '📊',
    color: '#ec4899',
    status: 'idle',
    currentTask: 'Waiting for task',
    computerOn: false,
    location: { x: 3, y: 3 },
  },
];

const desks = [
  { id: 1, x: 1, y: 1 },
  { id: 2, x: 2, y: 1 },
  { id: 3, x: 3, y: 1 },
  { id: 4, x: 1, y: 2 },
  { id: 5, x: 2, y: 2 },
  { id: 6, x: 3, y: 2 },
  { id: 7, x: 1, y: 3 },
  { id: 8, x: 2, y: 3 },
  { id: 9, x: 3, y: 3 },
];

export default function Office({ theme }: { theme: Theme }) {
  const [agents, setAgents] = useState<AgentWork[]>(offices);
  const [selectedAgent, setSelectedAgent] = useState<AgentWork | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return '#22c55e';
      case 'thinking': return '#8b5cf6';
      case 'break': return '#f97316';
      default: return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working': return 'Working';
      case 'thinking': return 'Thinking';
      case 'break': return 'On Break';
      default: return 'Idle';
    }
  };

  const workingCount = agents.filter(a => a.status === 'working' || a.status === 'thinking').length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>Office</h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            {workingCount} working · {agents.length - workingCount} available
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px 16px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: theme.text,
          }}>
            🕐 {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '2fr 1fr' : '1fr', gap: '16px' }}>
        {/* Office Floor */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '24px',
          minHeight: '500px',
          position: 'relative',
        }}>
          {/* Office Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '16px',
            height: '450px',
          }}>
            {/* Desks Grid */}
            {desks.map(desk => {
              const agent = agents.find(a => a.location.x === desk.x && a.location.y === desk.y);
              return (
                <div
                  key={desk.id}
                  style={{
                    background: agent ? `${agent.color}15` : theme.background,
                    border: `2px dashed ${agent ? agent.color : theme.border}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    cursor: agent ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => agent && setSelectedAgent(agent)}
                >
                  {/* Computer */}
                  <div style={{
                    width: '60px',
                    height: '40px',
                    background: agent?.computerOn ? agent.color : theme.textSecondary,
                    borderRadius: '4px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: agent?.computerOn ? 1 : 0.3,
                  }}>
                    {agent?.computerOn && <span style={{ fontSize: '16px' }}>💻</span>}
                  </div>
                  
                  {/* Agent */}
                  {agent && (
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '8px',
                      animation: agent.status === 'thinking' ? 'pulse 1.5s infinite' : 'none',
                    }}>
                      {agent.avatar}
                    </div>
                  )}
                  
                  {/* Agent Name */}
                  {agent && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: agent.color,
                    }}>
                      {agent.name.split(' ')[0]}
                    </span>
                  )}
                  
                  {/* Empty Desk */}
                  {!agent && (
                    <span style={{ fontSize: '12px', color: theme.textSecondary, opacity: 0.5 }}>
                      Empty
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Agent Panel */}
        {selectedAgent && (
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${selectedAgent.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                margin: '0 auto 16px',
              }}>
                {selectedAgent.avatar}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '4px' }}>
                {selectedAgent.name}
              </h3>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: `${getStatusColor(selectedAgent.status)}20`,
                color: getStatusColor(selectedAgent.status),
                fontSize: '12px',
                fontWeight: '600',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getStatusColor(selectedAgent.status),
                }} />
                {getStatusLabel(selectedAgent.status)}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>
                Current Task
              </h4>
              <p style={{ fontSize: '14px', color: theme.text }}>
                {selectedAgent.currentTask}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px', textTransform: 'uppercase' }}>
                Status
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>
                  {selectedAgent.computerOn ? '🟢' : '⚪'}
                </span>
                <span style={{ fontSize: '14px', color: theme.text }}>
                  Computer {selectedAgent.computerOn ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Agent List (when none selected) */}
        {!selectedAgent && (
          <div style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px' }}>
              All Agents
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{agent.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{agent.name}</div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>{agent.currentTask}</div>
                  </div>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: getStatusColor(agent.status),
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
