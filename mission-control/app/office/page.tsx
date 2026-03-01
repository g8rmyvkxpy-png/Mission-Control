'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Room {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  maxMembers: number;
  activity: 'active' | 'quiet' | 'empty';
}

interface Person {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  room?: string;
  role: string;
}

const rooms: Room[] = [
  { id: 'main', name: 'Main Hall', icon: '🏠', description: 'General discussion and announcements', members: 3, maxMembers: 50, activity: 'active' },
  { id: 'warroom', name: 'War Room', icon: '⚔️', description: 'Strategy and planning sessions', members: 1, maxMembers: 10, activity: 'quiet' },
  { id: 'focus', name: 'Focus Zone', icon: '🎯', description: 'Deep work and focused tasks', members: 2, maxMembers: 5, activity: 'active' },
  { id: 'lounge', name: 'Lounge', icon: '☕', description: 'Casual chat and networking', members: 0, maxMembers: 20, activity: 'empty' },
  { id: 'studio', name: 'Content Studio', icon: '🎬', description: 'Content creation and review', members: 1, maxMembers: 8, activity: 'quiet' }
];

const people: Person[] = [
  { id: 'neo', name: 'Neo', avatar: '🦅', status: 'online', room: 'focus', role: 'AI Assistant' },
  { id: 'deva', name: 'Deva', avatar: '👤', status: 'online', room: 'main', role: 'Owner' },
  { id: 'scout', name: 'Scout', avatar: '🔍', status: 'busy', room: 'warroom', role: 'Lead Researcher' },
  { id: 'ink', name: 'Ink', avatar: '✍️', status: 'online', room: 'studio', role: 'Writer' },
  { id: 'builder', name: 'Builder', avatar: '🔨', status: 'away', role: 'Engineer' },
  { id: 'spark', name: 'Spark', avatar: '💡', status: 'offline', role: 'Researcher' }
];

export const dynamic = 'force-dynamic';

export default function OfficePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: '#3fb950',
      away: '#d29922',
      busy: '#f85149',
      offline: '#6e7681'
    };
    return colors[status] || '#8b949e';
  };

  const getActivityColor = (activity: string) => {
    const colors: Record<string, string> = {
      active: '#3fb950',
      quiet: '#d29922',
      empty: '#6e7681'
    };
    return colors[activity] || '#8b949e';
  };

  const getPeopleInRoom = (roomId: string) => people.filter(p => p.room === roomId);

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Office</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Office 🏢</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Virtual office - See who's around</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Time & Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24}}>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>Current Time</p>
            <p style={{fontSize: 24, fontWeight: 700, margin: '8px 0 0'}}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#3fb950', margin: 0}}>Online Now</p>
            <p style={{fontSize: 24, fontWeight: 700, margin: '8px 0 0', color: '#3fb950'}}>{people.filter(p => p.status === 'online').length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#d29922', margin: 0}}>In Rooms</p>
            <p style={{fontSize: 24, fontWeight: 700, margin: '8px 0 0', color: '#d29922'}}>{people.filter(p => p.room).length}</p>
          </div>
          <div className="card" style={{padding: 20, textAlign: 'center'}}>
            <p style={{fontSize: 12, color: '#8b949e', margin: 0}}>Total Rooms</p>
            <p style={{fontSize: 24, fontWeight: 700, margin: '8px 0 0'}}>{rooms.length}</p>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: selectedRoom ? '1fr 360px' : '1fr', gap: 24}}>
          {/* Rooms */}
          <div>
            <h2 style={{fontSize: 18, marginBottom: 16}}>Rooms</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16}}>
              {rooms.map(room => {
                const roomPeople = getPeopleInRoom(room.id);
                return (
                  <div 
                    key={room.id}
                    className="card"
                    style={{
                      padding: 20,
                      cursor: 'pointer',
                      border: selectedRoom?.id === room.id ? '2px solid #2f81f7' : '2px solid transparent'
                    }}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <span style={{fontSize: 28}}>{room.icon}</span>
                        <div>
                          <h3 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{room.name}</h3>
                          <p style={{margin: 0, fontSize: 12, color: '#8b949e'}}>{room.members}/{room.maxMembers} members</p>
                        </div>
                      </div>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getActivityColor(room.activity)
                      }} />
                    </div>
                    <p style={{margin: 0, fontSize: 13, color: '#8b949e'}}>{room.description}</p>
                    {roomPeople.length > 0 && (
                      <div style={{display: 'flex', gap: -8, marginTop: 12}}>
                        {roomPeople.slice(0, 5).map(p => (
                          <div key={p.id} style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#21262d',
                            border: '2px solid #0d1117',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            marginLeft: -8
                          }}>
                            {p.avatar}
                          </div>
                        ))}
                        {roomPeople.length > 5 && (
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#21262d',
                            border: '2px solid #0d1117',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            marginLeft: -8,
                            color: '#8b949e'
                          }}>
                            +{roomPeople.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Detail / People List */}
          <div>
            {selectedRoom ? (
              <div className="card" style={{padding: 24, position: 'sticky', top: 100}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <span style={{fontSize: 24}}>{selectedRoom.icon}</span>
                    <h3 style={{margin: 0}}>{selectedRoom.name}</h3>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} style={{background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer'}}>✕</button>
                </div>
                <p style={{color: '#8b949e', fontSize: 14, marginBottom: 16}}>{selectedRoom.description}</p>
                
                <h4 style={{fontSize: 13, color: '#8b949e', marginBottom: 12}}>In this room ({getPeopleInRoom(selectedRoom.id).length})</h4>
                {getPeopleInRoom(selectedRoom.id).length === 0 ? (
                  <p style={{color: '#8b949e', fontSize: 14}}>No one here yet</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    {getPeopleInRoom(selectedRoom.id).map(person => (
                      <div key={person.id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: '#0d1117', borderRadius: 8}}>
                        <div style={{position: 'relative'}}>
                          <span style={{fontSize: 24}}>{person.avatar}</span>
                          <span style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: getStatusColor(person.status),
                            border: '2px solid #0d1117'
                          }} />
                        </div>
                        <div>
                          <p style={{margin: 0, fontWeight: 500, fontSize: 14}}>{person.name}</p>
                          <p style={{margin: 0, fontSize: 12, color: '#8b949e'}}>{person.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{padding: 24}}>
                <h3 style={{margin: '0 0 16px', fontSize: 16}}>People ({people.length})</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {people.map(person => (
                    <div key={person.id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 8}}>
                      <div style={{position: 'relative'}}>
                        <span style={{fontSize: 24}}>{person.avatar}</span>
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: getStatusColor(person.status),
                          border: '2px solid #0d1117'
                        }} />
                      </div>
                      <div style={{flex: 1}}>
                        <p style={{margin: 0, fontWeight: 500, fontSize: 14}}>{person.name}</p>
                        <p style={{margin: 0, fontSize: 12, color: '#8b949e'}}>{person.role}</p>
                      </div>
                      {person.room && (
                        <span style={{fontSize: 12, color: '#8b949e'}}>
                          {rooms.find(r => r.id === person.room)?.icon}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/office" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>🏢</span><span style={{fontSize: 10}}>Office</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
