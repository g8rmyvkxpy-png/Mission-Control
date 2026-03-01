'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: string;
  description?: string;
}

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: '#2f81f7',
      deadline: '#f85149',
      reminder: '#d29922',
      task: '#3fb950'
    };
    return colors[type] || '#8b949e';
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Calendar</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Calendar 📅</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Schedule and events</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24}}>
          {/* Calendar */}
          <div className="card" style={{padding: 24}}>
            {/* Month Navigation */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
              <button onClick={prevMonth} style={{background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer', padding: 8}}>←</button>
              <h2 style={{margin: 0, fontSize: 20}}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={nextMonth} style={{background: 'none', border: 'none', color: '#8b949e', fontSize: 20, cursor: 'pointer', padding: 8}}>→</button>
            </div>

            {/* Day Names */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8}}>
              {dayNames.map(day => (
                <div key={day} style={{textAlign: 'center', padding: 8, color: '#8b949e', fontSize: 12, fontWeight: 500}}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4}}>
              {getDaysInMonth(currentDate).map((day, i) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div key={i} style={{
                    minHeight: 80,
                    padding: 8,
                    background: day ? (isToday(day) ? 'rgba(47,129,247,0.1)' : '#0d1117') : 'transparent',
                    borderRadius: 8,
                    border: day ? '1px solid #21262d' : 'none'
                  }}>
                    {day && (
                      <>
                        <div style={{fontWeight: isToday(day) ? 700 : 400, color: isToday(day) ? '#2f81f7' : '#f0f6fc', marginBottom: 4}}>{day}</div>
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event.id} style={{
                            fontSize: 10,
                            padding: '2px 4px',
                            background: `${getEventColor(event.type)}20`,
                            color: getEventColor(event.type),
                            borderRadius: 4,
                            marginBottom: 2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{fontSize: 10, color: '#8b949e'}}>+{dayEvents.length - 2} more</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="card" style={{padding: 24}}>
              <h3 style={{margin: '0 0 16px', fontSize: 16}}>Upcoming Events</h3>
              {loading ? (
                <p style={{color: '#8b949e'}}>Loading...</p>
              ) : events.length === 0 ? (
                <p style={{color: '#8b949e'}}>No upcoming events</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} style={{display: 'flex', gap: 12, padding: 12, background: '#0d1117', borderRadius: 8}}>
                      <div style={{width: 4, borderRadius: 2, background: getEventColor(event.type)}} />
                      <div>
                        <div style={{fontWeight: 500, fontSize: 14}}>{event.title}</div>
                        <div style={{fontSize: 12, color: '#8b949e', marginTop: 4}}>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {event.time && ` at ${event.time}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/calendar" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>📅</span><span style={{fontSize: 10}}>Calendar</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
