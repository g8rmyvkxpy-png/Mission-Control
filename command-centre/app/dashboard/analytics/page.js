'use client';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/revenue').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/goals').then(r => r.json()),
      fetch('/api/memories').then(r => r.json()),
    ]).then(([tasks, agents, revenue, projects, goals, memories]) => {
      setData({
        tasks: tasks.tasks || [],
        agents: agents.agents || [],
        revenue: revenue.entries || revenue.revenue || [],
        projects: projects.projects || [],
        goals: goals.goals || [],
        memories: memories.memories || [],
      });
    });
  }, []);

  if (!data) return <div style={{padding:40,textAlign:'center',color:'#666'}}>Loading Analytics...</div>;

  // Calculate metrics
  const totalRevenue = data.revenue.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const completedTasks = data.tasks.filter(t => t.status === 'done').length;
  const activeTasks = data.tasks.filter(t => t.status !== 'done').length;
  const onlineAgents = data.agents.filter(a => a.status === 'online').length;
  
  // Task completion rate
  const completionRate = data.tasks.length > 0 ? Math.round((completedTasks / data.tasks.length) * 100) : 0;
  
  // Revenue by source
  const revenueBySource = {};
  data.revenue.forEach(r => {
    const source = r.source || 'Other';
    revenueBySource[source] = (revenueBySource[source] || 0) + (parseFloat(r.amount) || 0);
  });

  // Tasks by status
  const tasksByStatus = { done: 0, in_progress: 0, review: 0, pending: 0 };
  data.tasks.forEach(t => {
    const status = t.status || 'pending';
    tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
  });

  // Calculate trends (mock - would need historical data for real trends)
  const weeklyTasks = completedTasks;
  const weeklyRevenue = totalRevenue;

  const Card = ({ children, title, color = '#3b82f6' }) => (
    <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, border: `1px solid ${color}30` }}>
      {title && <div style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>{title}</div>}
      {children}
    </div>
  );

  const Stat = ({ label, value, subvalue, color = '#fff' }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#666' }}>{label}</div>
      {subvalue && <div style={{ fontSize: 10, color: '#10b981', marginTop: 4 }}>{subvalue}</div>}
    </div>
  );

  const ProgressBar = ({ value, max, color = '#3b82f6', label }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#666' }}>{value}/{max}</span>
      </div>
      <div style={{ height: 8, background: '#0a0a15', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(value/max)*100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 24, background: '#0a0a15', minHeight: 'calc(100vh - 120px)', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>📊 Analytics</h1>
          <p style={{ color: '#666', fontSize: 12, margin: '4px 0 0' }}>Track your progress toward $1M ARR</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ background: '#1a1a2e', color: '#fff', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card title="💰 TOTAL REVENUE" color="#10b981">
          <Stat label="All time" value={`$${totalRevenue.toLocaleString()}`} color="#10b981" />
        </Card>
        <Card title="✅ TASK COMPLETION" color="#3b82f6">
          <Stat label="Completion rate" value={`${completionRate}%`} subvalue={`${completedTasks}/${data.tasks.length} tasks`} color="#3b82f6" />
        </Card>
        <Card title="🎯 GOALS PROGRESS" color="#8b5cf6">
          <Stat label="Completed" value={data.goals.filter(g => g.status === 'completed').length} subvalue={`${data.goals.length} total goals`} color="#8b5cf6" />
        </Card>
        <Card title="🤖 AGENT ACTIVITY" color="#f59e0b">
          <Stat label="Online" value={onlineAgents} subvalue={`of ${data.agents.length} agents`} color="#f59e0b" />
        </Card>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Task Status Breakdown */}
        <Card title="📋 TASKS BY STATUS" color="#3b82f6">
          <ProgressBar value={tasksByStatus.done} max={data.tasks.length || 1} color="#10b981" label="Done" />
          <ProgressBar value={tasksByStatus.in_progress} max={data.tasks.length || 1} color="#3b82f6" label="In Progress" />
          <ProgressBar value={tasksByStatus.review} max={data.tasks.length || 1} color="#f59e0b" label="Review" />
          <ProgressBar value={tasksByStatus.pending} max={data.tasks.length || 1} color="#6b7280" label="Pending" />
        </Card>

        {/* Revenue Breakdown */}
        <Card title="💰 REVENUE BY SOURCE" color="#10b981">
          {Object.keys(revenueBySource).length === 0 ? (
            <p style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 40 }}>No revenue data yet</p>
          ) : (
            Object.entries(revenueBySource).map(([source, amount]) => (
              <ProgressBar 
                key={source}
                value={amount} 
                max={totalRevenue || 1} 
                color="#10b981" 
                label={`${source}: $${amount.toLocaleString()}`} 
              />
            ))
          )}
        </Card>
      </div>

      {/* Progress to $1M */}
      <Card title="🎯 PATH TO $1M ARR" color="#8b5cf6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 16 }}>
          {[
            { milestone: '$10K', current: totalRevenue >= 10000, color: '#10b981' },
            { milestone: '$50K', current: totalRevenue >= 50000, color: '#10b981' },
            { milestone: '$100K', current: totalRevenue >= 100000, color: '#10b981' },
            { milestone: '$250K', current: totalRevenue >= 250000, color: '#10b981' },
            { milestone: '$500K', current: totalRevenue >= 500000, color: '#10b981' },
            { milestone: '$1M', current: totalRevenue >= 1000000, color: '#10b981' },
          ].map((m, i) => (
            <div key={m.milestone} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', 
                background: m.current ? m.color : '#1a1a2e', 
                border: `2px solid ${m.current ? m.color : '#333'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: 20
              }}>
                {m.current ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 11, color: m.current ? m.color : '#666' }}>{m.milestone}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#888' }}>Current: <span style={{ color: '#10b981', fontWeight: 700 }}>${totalRevenue.toLocaleString()}</span></div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Progress: {((totalRevenue / 1000000) * 100).toFixed(2)}% to $1M</div>
        </div>
      </Card>

      {/* Agent Performance */}
      <div style={{ marginTop: 24 }}>
        <Card title="🤖 AGENT PERFORMANCE" color="#f59e0b">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
            {data.agents.map(agent => {
              const agentTasks = data.tasks.filter(t => t.assigned_to === agent.id);
              const done = agentTasks.filter(t => t.status === 'done').length;
              return (
                <div key={agent.id} style={{ background: '#0a0a15', padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ 
                      width: 32, height: 32, borderRadius: '50%', 
                      background: agent.status === 'online' ? '#10b981' : '#666',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700
                    }}>
                      {agent.name?.[0] || '?'}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{agent.name}</div>
                      <div style={{ fontSize: 10, color: '#666' }}>{agent.status}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {done} tasks completed
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
