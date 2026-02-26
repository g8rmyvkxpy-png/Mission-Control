'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'cron' | 'task' | 'reminder';
  description: string;
}

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({ theme }: { theme: Theme }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '09:00', type: 'task' as CalendarEvent['type'], description: '' });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error('Failed to load events:', e);
    }
  };

  const saveEvents = async (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: newEvents, tasks: [], activities: [], content: [], memories: [], chatMessages: [] }),
      });
    } catch (e) {
      console.error('Failed to save events:', e);
    }
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      description: newEvent.description,
    };
    saveEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '09:00', type: 'task', description: '' });
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter(e => e.id !== id));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getEventsForDay = (day: number) => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text }}>Calendar</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '10px 20px',
            background: theme.accent,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Add Event
        </button>
      </div>

      {showAdd && (
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Event title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              style={{
                padding: '12px',
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
              }}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              style={{
                padding: '12px',
                background: theme.background,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
              }}
            />
          </div>
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
            style={{
              width: '100%',
              padding: '12px',
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
              marginBottom: '12px',
            }}
          >
            <option value="task">Task</option>
            <option value="cron">Cron Job</option>
            <option value="reminder">Reminder</option>
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addEvent}
              style={{
                padding: '10px 20px',
                background: theme.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add Event
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: theme.text, fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: theme.text }}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: theme.text, fontSize: '24px', cursor: 'pointer' }}>→</button>
      </div>

      {/* Days Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {days.map(day => (
          <div key={day} style={{ textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: '600', color: theme.textSecondary }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {daysInMonth.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          return (
            <div
              key={idx}
              style={{
                minHeight: '80px',
                padding: '8px',
                background: day ? theme.surface : 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                borderColor: isToday(day || 0) ? theme.accent : theme.border,
              }}
            >
              {day && (
                <>
                  <div style={{ fontSize: '14px', fontWeight: isToday(day) ? '700' : '400', color: isToday(day) ? theme.accent : theme.text, marginBottom: '4px' }}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        marginBottom: '2px',
                        borderRadius: '4px',
                        background: event.type === 'cron' ? '#3b82f620' : event.type === 'reminder' ? '#f9731620' : '#22c55e20',
                        color: event.type === 'cron' ? '#3b82f6' : event.type === 'reminder' ? '#f97316' : '#22c55e',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={event.title}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={{ fontSize: '10px', color: theme.textSecondary }}>+{dayEvents.length - 2} more</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.text, marginBottom: '16px' }}>Upcoming Events</h3>
        {events.length === 0 ? (
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>No events scheduled</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events
              .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
              .slice(0, 5)
              .map(event => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{event.title}</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: event.type === 'cron' ? '#3b82f620' : event.type === 'reminder' ? '#f9731620' : '#22c55e20',
                        color: event.type === 'cron' ? '#3b82f6' : event.type === 'reminder' ? '#f97316' : '#22c55e',
                      }}>
                        {event.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                      {event.date} at {event.time}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.textSecondary,
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
