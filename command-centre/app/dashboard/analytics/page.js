'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Daily targets for each agent
const DAILY_TARGETS = {
  'Neo': 4,
  'Atlas': 6,
  'Orbit': 6
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [tasksOverTime, setTasksOverTime] = useState([]);
  const [agentSummary, setAgentSummary] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [taskTypes, setTaskTypes] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [overviewRes, tasksRes, agentRes, heatmapRes, typesRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch(`/api/analytics/tasks-over-time?days=${timeRange}`),
        fetch('/api/analytics/agent-summary'),
        fetch('/api/analytics/heatmap'),
        fetch(`/api/analytics/task-types?range=${timeRange === 'all' ? 'all' : timeRange === '1' ? 'today' : timeRange === '7' ? 'week' : 'month'}`)
      ]);

      const overviewData = await overviewRes.json();
      const tasksData = await tasksRes.json();
      const agentData = await agentRes.json();
      const heatmapData = await heatmapRes.json();
      const typesData = await typesRes.json();

      setOverview(overviewData);
      setTasksOverTime(tasksData.data || []);
      setAgentSummary(agentData.agents || []);
      setHeatmap(heatmapData.heatmap || []);
      setTaskTypes(typesData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
    setLoading(false);
  }

  // Calculate utilization rate for each agent
  const getUtilizationRate = (agent) => {
    const target = DAILY_TARGETS[agent.name] || 4;
    const completed = agent.tasks_completed || 0;
    // Cap at 100%
    return Math.min(Math.round((completed / target) * 100), 100);
  };

  // Format heatmap data for display
  const getHeatmapCell = (day, hour) => {
    const dayData = heatmap.find(d => d.day === day);
    if (!dayData) return 0;
    const hourData = dayData.hours.find(h => h.hour === hour);
    return hourData?.count || 0;
  };

  const maxHeatmapValue = Math.max(...heatmap.flatMap(d => d.hours.map(h => h.count)), 1);

  const getHeatmapColor = (count) => {
    if (count === 0) return 'var(--bg)';
    const intensity = Math.min(count / maxHeatmapValue, 1);
    return `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`;
  };

  // Calculate overall utilization
  const getOverallUtilization = () => {
    if (agentSummary.length === 0) return 0;
    const totalUtil = agentSummary.reduce((sum, agent) => sum + getUtilizationRate(agent), 0);
    return Math.round(totalUtil / agentSummary.length);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Analytics</h1>
        <div className="time-range-filter">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1">Today</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{overview?.tasksCompletedToday || 0}</div>
            <div className="stat-label">Tasks Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{overview?.tasksCompletedThisWeek || 0}</div>
            <div className="stat-label">Tasks This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{getOverallUtilization()}%</div>
            <div className="stat-label">Utilization Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{overview?.mostProductiveAgent?.agentName || 'N/A'}</div>
            <div className="stat-label">Most Productive</div>
          </div>
        </div>
      </div>

      {/* Chart 1: Tasks Over Time (Line Chart) */}
      <div className="chart-section">
        <h2>📈 Tasks Over Time</h2>
        <div className="chart-container">
          {tasksOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {agentSummary.slice(0, 5).map((agent, idx) => (
                  <Line
                    key={agent.id}
                    type="monotone"
                    dataKey={agent.name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No task data available</div>
          )}
        </div>
      </div>

      {/* Chart 2: Agent Productivity (Bar Chart) */}
      <div className="chart-section">
        <h2>👥 Agent Productivity</h2>
        <div className="chart-container">
          {agentSummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentSummary} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="var(--text-muted)" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="tasks_completed" fill="#10b981" name="Completed" />
                <Bar dataKey="tasks_in_progress" fill="#f59e0b" name="In Progress" />
                <Bar dataKey="tasks_in_backlog" fill="#6b7280" name="Backlog" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No agent data available</div>
          )}
        </div>
      </div>

      {/* Chart 3: Activity Heatmap */}
      <div className="chart-section">
        <h2>🔥 Activity Heatmap</h2>
        <div className="chart-container heatmap-container">
          <div className="heatmap">
            <div className="heatmap-row heatmap-header">
              <div className="heatmap-label"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="heatmap-hour">{i}</div>
              ))}
            </div>
            {heatmap.map((day) => (
              <div key={day.day} className="heatmap-row">
                <div className="heatmap-label">{day.dayName}</div>
                {day.hours.map((hour) => (
                  <div
                    key={hour.hour}
                    className="heatmap-cell"
                    style={{ background: getHeatmapColor(hour.count) }}
                    title={`${day.dayName} ${hour.hour}:00 - ${hour.count} logs`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-scale">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="legend-cell"
                  style={{ background: `rgba(16, 185, 129, ${intensity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Chart 4: Task Priority Breakdown (Pie Chart) */}
      <div className="chart-section">
        <h2>🎯 Task Priority Breakdown</h2>
        <div className="chart-container">
          {taskTypes?.pieData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskTypes.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskTypes.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No task priority data available</div>
          )}
        </div>
      </div>

      {/* Agent Leaderboard with Utilization Bars */}
      <div className="chart-section">
        <h2>🏆 Agent Leaderboard</h2>
        <div className="leaderboard">
          {agentSummary.map((agent, idx) => {
            const utilization = getUtilizationRate(agent);
            const target = DAILY_TARGETS[agent.name] || 4;
            return (
              <div key={agent.id} className="leaderboard-item">
                <div className="leaderboard-rank">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <div 
                  className="leaderboard-avatar"
                  style={{ background: agent.avatar_color || '#10b981' }}
                >
                  {agent.name?.charAt(0) || '?'}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{agent.name}</div>
                  <div className="leaderboard-stats">
                    <span>✅ {agent.tasks_completed}</span>
                    <span>🔄 {agent.tasks_in_progress}</span>
                    <span>📋 {agent.tasks_in_backlog}</span>
                  </div>
                  {/* Utilization Bar */}
                  <div className="utilization-bar-container">
                    <div className="utilization-bar-label">
                      <span>Daily Target: {agent.tasks_completed}/{target}</span>
                      <span className="utilization-percent">{utilization}%</span>
                    </div>
                    <div className="utilization-bar">
                      <div 
                        className="utilization-fill" 
                        style={{ 
                          width: `${utilization}%`,
                          background: utilization >= 100 ? '#10b981' : utilization >= 75 ? '#3b82f6' : utilization >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                      <div 
                        className="utilization-target-line" 
                        style={{ left: '100%' }}
                        title="Target"
                      />
                    </div>
                  </div>
                </div>
                <div className="leaderboard-time">
                  ⏱️ {agent.avg_completion_time_minutes || 0}m avg
                </div>
              </div>
            );
          })}
          {agentSummary.length === 0 && (
            <div className="no-data">No agents found</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .analytics-page {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .analytics-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        .time-range-filter {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .time-range-filter label {
          color: var(--text-muted);
          font-size: 14px;
        }
        .time-range-filter select {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .stat-icon {
          font-size: 32px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .chart-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .chart-section h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .chart-container {
          width: 100%;
          min-height: 300px;
        }
        .no-data {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-muted);
          font-size: 14px;
        }
        
        /* Heatmap styles */
        .heatmap-container {
          overflow-x: auto;
        }
        .heatmap {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 800px;
        }
        .heatmap-row {
          display: flex;
          gap: 2px;
          align-items: center;
        }
        .heatmap-header {
          margin-bottom: 4px;
        }
        .heatmap-label {
          width: 40px;
          font-size: 11px;
          color: var(--text-muted);
          text-align: right;
          padding-right: 8px;
        }
        .heatmap-hour {
          width: 28px;
          font-size: 10px;
          color: var(--text-muted);
          text-align: center;
        }
        .heatmap-cell {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .heatmap-cell:hover {
          transform: scale(1.2);
        }
        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .legend-scale {
          display: flex;
          gap: 2px;
        }
        .legend-cell {
          width: 16px;
          height: 16px;
          border-radius: 2px;
        }
        
        /* Leaderboard styles */
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg);
          border-radius: 8px;
          transition: background 0.2s;
        }
        .leaderboard-item:hover {
          background: var(--bg-card);
        }
        .leaderboard-rank {
          font-size: 20px;
          width: 40px;
          text-align: center;
        }
        .leaderboard-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 16px;
        }
        .leaderboard-info {
          flex: 1;
        }
        .leaderboard-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .leaderboard-stats {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .leaderboard-time {
          font-size: 13px;
          color: var(--text-muted);
        }
        
        /* Utilization Bar */
        .utilization-bar-container {
          margin-top: 8px;
        }
        .utilization-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .utilization-percent {
          font-weight: 600;
          color: var(--text);
        }
        .utilization-bar {
          position: relative;
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: visible;
        }
        .utilization-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .utilization-target-line {
          position: absolute;
          top: -2px;
          width: 2px;
          height: 12px;
          background: var(--text-muted);
          opacity: 0.5;
        }
        
        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 16px;
        }
        .loading-spinner {
          font-size: 48px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
