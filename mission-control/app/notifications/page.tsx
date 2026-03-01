'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const NOTIFICATIONS = [
  { id: 1, title: 'Task Completed', message: 'Research AI trends finished successfully', time: '5 min ago', icon: '✅', type: 'success' },
  { id: 2, title: 'New Lead', message: 'Mike Chen from Enterprise Inc submitted a form', time: '1 hour ago', icon: '👤', type: 'info' },
  { id: 3, title: 'Agent Deployed', message: 'Sales Scout is now active', time: '2 hours ago', icon: '🤖', type: 'success' },
  { id: 4, title: 'Usage Alert', message: 'You\'ve used 12% of your monthly tasks', time: '3 hours ago', icon: '⚠️', type: 'warning' },
];

export default function NotificationsPage() {
  return (
    <div style={containerStyle}>
      <div style={mobileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><span style={{ fontSize: '24px' }}>🎯</span></Link>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>Notifications</span>
        </div>
        <button style={markAllBtn}>Mark all read</button>
      </div>

      <div style={mainContent}>
        <h1 style={pageTitle}>Notifications 🔔</h1>
        <p style={pageSubtitle}>Stay updated on your AI workforce</p>

        <div style={listCard}>
          {NOTIFICATIONS.map(n => (
            <div key={n.id} style={notifItem}>
              <div style={iconBox}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{n.title}</p>
                <p style={{ fontSize: '13px', color: '#8b949e', marginTop: '2px' }}>{n.message}</p>
                <p style={{ fontSize: '11px', color: '#6e7681', marginTop: '4px' }}>{n.time}</p>
              </div>
              <span style={{ ...dot, background: n.type === 'success' ? '#3fb950' : n.type === 'warning' ? '#d29922' : '#2f81f7' }}></span>
            </div>
          ))}
        </div>
      </div>

      <div style={bottomNav}>
        <Link href="/" style={bottomNavItem}><span style={{ fontSize: '20px' }}>🏠</span><span style={{ fontSize: '10px' }}>Home</span></Link>
        <Link href="/tasks" style={bottomNavItem}><span style={{ fontSize: '20px' }}>📋</span><span style={{ fontSize: '10px' }}>Tasks</span></Link>
        <Link href="/agents" style={bottomNavItem}><span style={{ fontSize: '20px' }}>🤖</span><span style={{ fontSize: '10px' }}>Agents</span></Link>
        <Link href="/settings" style={bottomNavItem}><span style={{ fontSize: '20px' }}>⚙️</span><span style={{ fontSize: '10px' }}>Settings</span></Link>
      </div>
    </div>
  );
}

const containerStyle = { minHeight: '100vh', background: '#030712', color: '#f0f6fc', fontFamily: 'Inter, sans-serif', paddingBottom: '80px' };
const mobileHeader = { display: 'flex', position: 'fixed' as const, top: 0, left: 0, right: 0, height: '60px', background: '#0f1117', borderBottom: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 };
const markAllBtn: React.CSSProperties = { padding: '8px 16px', background: '#21262d', color: '#f0f6fc', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };
const mainContent = { padding: '80px 16px 24px', maxWidth: '600px', margin: '0 auto' };
const pageTitle = { fontSize: '24px', fontWeight: 700, marginBottom: '4px' };
const pageSubtitle = { color: '#8b949e', fontSize: '14px', marginBottom: '24px' };
const listCard = { background: '#0f1117', border: '1px solid #21262d', borderRadius: '12px', overflow: 'hidden' };
const notifItem = { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderBottom: '1px solid #21262d' };
const iconBox = { width: '40px', height: '40px', borderRadius: '10px', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' };
const dot: React.CSSProperties = { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 };
const bottomNav = { display: 'flex', position: 'fixed' as const, bottom: 0, left: 0, right: 0, height: '65px', background: '#0f1117', borderTop: '1px solid #21262d', padding: '0 16px', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000 };
const bottomNavItem = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px', color: '#8b949e', textDecoration: 'none', fontSize: '12px' };
