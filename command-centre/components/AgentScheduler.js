'use client';

import { useState, useEffect } from 'react';

const AGENT_COLORS = {
  'Neo': '#10b981',
  'Atlas': '#3b82f6',
  'Orbit': '#f97316'
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function AgentScheduler({ agents }) {
  const [view, setView] = useState('week'); // 'day' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterAgent, setFilterAgent] = useState('all');
  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [currentDate, filterAgent]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (view === 'today') params.append('type', 'today');
      else if (view === 'week') params.append('type', 'week');
      
      if (filterAgent !== 'all') {
        const agent = agents.find(a => a.name === filterAgent);
        if (agent) params.append('agent_id', agent.id);
      }
      
      const res = await fetch(`/api/schedules?${params}`);
      const data = await res.json();
      
      setSchedules(data.schedules || []);
      setBlocks(data.blocks || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  }

  function navigateDate(direction) {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getWeekDays() {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    return DAYS.map((day, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { day, date, isToday: date.toDateString() === new Date().toDateString() };
    });
  }

  function getSchedulesForDay(dayIndex) {
    return schedules.filter(s => s.day_of_week === dayIndex);
  }

  function getBlocksForDate(date) {
    return blocks.filter(b => {
      const blockDate = new Date(b.scheduled_at);
      return blockDate.toDateString() === date.toDateString();
    });
  }

  function handleSlotClick(dayIndex, hour) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + dayIndex);
    date.setHours(hour, 0, 0, 0);
    
    setSelectedSlot({ date, hour });
    setShowAddModal(true);
  }

  async function handleDelete(scheduleId, type = 'schedule') {
    if (!confirm('Delete this schedule?')) return;
    
    await fetch(`/api/schedules?id=${scheduleId}&type=${type}`, {
      method: 'DELETE'
    });
    fetchData();
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  const weekDays = getWeekDays();
  const todayBlocks = blocks.filter(b => 
    new Date(b.scheduled_at).toDateString() === new Date().toDateString()
  ).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  return (
    <div>
      {/* Header Controls */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: 4, borderRadius: 6 }}>
            <button
              onClick={() => setView('week')}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: 'none',
                background: view === 'week' ? 'var(--bg-card)' : 'transparent',
                color: view === 'week' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: 'none',
                background: view === 'day' ? 'var(--bg-card)' : 'transparent',
                color: view === 'day' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Day
            </button>
          </div>

          {/* Date Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigateDate(-1)} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>←</button>
            <button onClick={goToToday} style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Today</button>
            <button onClick={() => navigateDate(1)} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 4, cursor: 'pointer' }}>→</button>
            <span style={{ fontWeight: 500, marginLeft: 8 }}>
              {view === 'week' 
                ? `${weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              }
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Agent Filter */}
          <select 
            value={filterAgent} 
            onChange={(e) => setFilterAgent(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.name}>{agent.name}</option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={() => { setSelectedSlot(null); setShowAddModal(true); }}>
            + Add Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : view === 'week' ? (
        /* Week View */
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header Row */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '8px 4px' }}></div>
          {weekDays.map(({ day, date, isToday }, i) => (
            <div key={i} style={{ 
              background: isToday ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)', 
              padding: '8px 4px', 
              textAlign: 'center',
              borderBottom: isToday ? '2px solid #10b981' : 'none'
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{day}</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{date.getDate()}</div>
            </div>
          ))}

          {/* Time Rows */}
          {HOURS.map(hour => (
            <>
              <div key={`h-${hour}`} style={{ background: 'var(--bg-tertiary)', padding: '4px', fontSize: 10, color: 'var(--text-secondary)', textAlign: 'right' }}>
                {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`}
              </div>
              {weekDays.map(({ dayIndex = weekDays.indexOf({day: DAYS[weekDays.indexOf(() => {})]}) }, i) => {
                // Fix: get day index properly
                const dayDate = new Date(currentDate);
                dayDate.setDate(dayDate.getDate() - dayDate.getDay() + i);
                
                const daySchedules = getSchedulesForDay(i).filter(s => {
                  const [startHour] = s.start_time.split(':').map(Number);
                  return startHour === hour;
                });
                
                const dayBlocks = getBlocksForDate(dayDate).filter(b => {
                  const blockHour = new Date(b.scheduled_at).getHours();
                  return blockHour === hour;
                });
                
                const items = [...daySchedules, ...dayBlocks];
                
                return (
                  <div 
                    key={`${hour}-${i}`}
                    onClick={() => handleSlotClick(i, hour)}
                    style={{ 
                      background: 'var(--bg-card)', 
                      minHeight: 40,
                      padding: 2,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {items.map((item, j) => {
                      const agent = agents.find(a => a.id === item.agent_id);
                      const colour = AGENT_COLORS[agent?.name] || '#888';
                      const isBlock = item.scheduled_at;
                      
                      return (
                        <div 
                          key={j}
                          onClick={(e) => { e.stopPropagation(); }}
                          style={{
                            background: colour + '20',
                            borderLeft: `3px solid ${colour}`,
                            padding: '2px 4px',
                            fontSize: 9,
                            borderRadius: 2,
                            marginBottom: 2,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{agent?.name?.[0]}</span> {item.label || item.title}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      ) : (
        /* Day View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
          {/* Main Day Grid */}
          <div>
            {/* Current Time Line */}
            {currentDate.toDateString() === new Date().toDateString() && (() => {
              const now = new Date();
              const currentHour = now.getHours() + now.getMinutes() / 60;
              const topPos = (currentHour / 24) * 100;
              
              return (
                <div style={{ 
                  position: 'absolute', 
                  left: 60, 
                  right: 0, 
                  top: `calc(40px + ${topPos}% * 20)`, 
                  height: 2, 
                  background: '#ef4444', 
                  zIndex: 10,
                  pointerEvents: 'none'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: -8, 
                    top: -4, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: '#ef4444' 
                  }} />
                </div>
              );
            })()}
            
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(3, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              {/* Header */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '12px 4px' }}></div>
              {agents.map((agent, i) => (
                <div key={agent.id} style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '8px 4px', 
                  textAlign: 'center',
                  borderBottom: `3px solid ${AGENT_COLORS[agent.name] || '#888'}`
                }}>
                  <div className="avatar" style={{ 
                    width: 32, 
                    height: 32, 
                    margin: '0 auto 4px',
                    background: AGENT_COLORS[agent.name] || '#888'
                  }}>
                    {agent.name?.[0]}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{agent.name}</div>
                </div>
              ))}

              {/* Time Rows */}
              {HOURS.filter((_, i) => i >= 6 && i <= 22).map(hour => (
                <>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '8px 4px', fontSize: 10, color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                  </div>
                  {[0, 1, 2].map(agentIndex => {
                    const agent = agents[agentIndex];
                    if (!agent) return <div key={`${hour}-${agentIndex}`} style={{ background: 'var(--bg-card)', minHeight: 50 }} />;
                    
                    const dateToCheck = new Date(currentDate);
                    dateToCheck.setHours(hour, 0, 0, 0);
                    
                    const hourSchedules = getSchedulesForDay(currentDate.getDay()).filter(s => {
                      const [startHour] = s.start_time.split(':').map(Number);
                      return startHour === hour && s.agent_id === agent.id;
                    });
                    
                    const hourBlocks = getBlocksForDate(dateToCheck).filter(b => {
                      const blockHour = new Date(b.scheduled_at).getHours();
                      return blockHour === hour && b.agent_id === agent.id;
                    });
                    
                    const items = [...hourSchedules, ...hourBlocks];
                    const colour = AGENT_COLORS[agent.name] || '#888';
                    
                    return (
                      <div 
                        key={`${hour}-${agentIndex}`}
                        onClick={() => { setSelectedSlot({ date: dateToCheck, hour }); setShowAddModal(true); }}
                        style={{ 
                          background: 'var(--bg-card)', 
                          minHeight: 50,
                          padding: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {items.map((item, j) => (
                          <div 
                            key={j}
                            style={{
                              background: colour + '30',
                              borderLeft: `3px solid ${colour}`,
                              padding: '4px 6px',
                              fontSize: 11,
                              borderRadius: 4,
                              marginBottom: 2
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{item.label || item.title}</div>
                            {item.start_time && (
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                                {formatTime(item.start_time)} - {formatTime(item.end_time)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Today's Schedule Sidebar */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Today's Schedule</h3>
            
            {todayBlocks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                No blocks scheduled for today
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayBlocks.map(block => {
                  const agent = agents.find(a => a.id === block.agent_id);
                  const colour = AGENT_COLORS[agent?.name] || '#888';
                  const time = new Date(block.scheduled_at);
                  
                  return (
                    <div key={block.id} style={{ 
                      background: 'var(--bg)', 
                      borderRadius: 8, 
                      padding: 10,
                      borderLeft: `3px solid ${colour}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div className="avatar" style={{ width: 20, height: 20, fontSize: 10, background: colour }}>
                          {agent?.name?.[0]}
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{block.title}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {block.duration_minutes}min
                      </div>
                      <span style={{ 
                        fontSize: 10, 
                        padding: '2px 6px', 
                        borderRadius: 4,
                        background: block.status === 'completed' ? '#10b98120' : block.status === 'running' ? '#f59e0b20' : '#88820',
                        color: block.status === 'completed' ? '#10b981' : block.status === 'running' ? '#f59e0b' : '#888'
                      }}>
                        {block.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <AddScheduleModal
          agents={agents}
          initialDate={selectedSlot?.date}
          initialHour={selectedSlot?.hour}
          onClose={() => { setShowAddModal(false); setSelectedSlot(null); }}
          onCreated={() => { setShowAddModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function AddScheduleModal({ agents, initialDate, initialHour, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    agent_id: agents[0]?.id || '',
    title: '',
    description: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    start_time: initialHour !== undefined ? `${String(initialHour).padStart(2, '0')}:00` : '09:00',
    duration_minutes: 60,
    task_type: 'general',
    repeat: 'once'
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.repeat === 'once') {
        // Create a block
        const scheduledAt = new Date(formData.date);
        const [hours, minutes] = formData.start_time.split(':');
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'block',
            agent_id: formData.agent_id,
            title: formData.title,
            description: formData.description,
            scheduled_at: scheduledAt.toISOString(),
            duration_minutes: formData.duration_minutes,
            task_type: formData.task_type
          })
        });
      } else {
        // Create recurring schedule(s)
        const days = formData.repeat === 'daily' ? [0,1,2,3,4,5,6] :
                     formData.repeat === 'weekdays' ? [1,2,3,4,5] : 
                     [new Date(formData.date).getDay()];

        for (const day of days) {
          await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'schedule',
              agent_id: formData.agent_id,
              day_of_week: day,
              start_time: formData.start_time,
              end_time: calculateEndTime(formData.start_time, formData.duration_minutes),
              task_type: formData.task_type,
              label: formData.title,
              colour: AGENT_COLORS[agents.find(a => a.id === formData.agent_id)?.name]
            })
          });
        }
      }
      onCreated();
    } catch (err) {
      console.error('Error creating schedule:', err);
    } finally {
      setLoading(false);
    }
  }

  function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Schedule Block</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Agent</label>
            <select 
              className="form-select"
              value={formData.agent_id}
              onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              required
            >
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Morning Research"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input 
                type="time" 
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select 
                className="form-select"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Task Type</label>
              <select 
                className="form-select"
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              >
                <option value="general">General</option>
                <option value="research">Research</option>
                <option value="operations">Operations</option>
                <option value="reporting">Reporting</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Repeat</label>
            <select 
              className="form-select"
              value={formData.repeat}
              onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
