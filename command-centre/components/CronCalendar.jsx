'use client';

import { useState, useMemo } from 'react';

export default function CronCalendar({ cronJobs }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  }, [currentDate]);

  function getEventsForDay(date) {
    return cronJobs.filter((cron) => {
      if (!cron.next_run || cron.status !== 'active') return false;
      const nextRun = new Date(cron.next_run);
      return (
        nextRun.getDate() === date.getDate() &&
        nextRun.getMonth() === date.getMonth() &&
        nextRun.getFullYear() === date.getFullYear()
      );
    });
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={prevMonth}>← Prev</button>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="btn btn-sm" onClick={nextMonth}>Next →</button>
      </div>

      {/* Grid */}
      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          const events = getEventsForDay(day.date);
          
          return (
            <div
              key={idx}
              className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${isToday(day.date) ? 'today' : ''}`}
              style={{ opacity: day.isCurrentMonth ? 1 : 0.4 }}
            >
              <div className="calendar-day-number">{day.date.getDate()}</div>
              {events.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="calendar-event"
                  style={{ background: event.agent?.avatar_color || 'var(--accent-blue)' }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {events.length > 2 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  +{events.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
