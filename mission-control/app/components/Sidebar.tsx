'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/workflows', label: 'Workflows', icon: '🔄' },
  { href: '/agents', label: 'Agents', icon: '🤖' },
  { href: '/team', label: 'Team', icon: '👥' },
  { href: '/projects', label: 'Projects', icon: '📁' },
  { href: '/leads', label: 'Leads', icon: '🎯' },
  { href: '/contacts', label: 'Contacts', icon: '📒' },
  { href: '/memory', label: 'Memory', icon: '🧠' },
  { href: '/automations', label: 'Automations', icon: '⚡' },
];

const secondaryItems = [
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/usage', label: 'Usage', icon: '💳' },
  { href: '/integrations', label: 'Integrations', icon: '🔌' },
  { href: '/billing', label: 'Billing', icon: '💰' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{
      width: isCollapsed ? '60px' : '240px',
      minHeight: '100vh',
      background: '#0f1117',
      borderRight: '1px solid #21262d',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          {!isCollapsed && <span style={{ fontWeight: 700, color: '#f0f6fc', fontSize: '16px' }}>Mission Control</span>}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '16px' }}
          >
            ◀
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: '12px', textAlign: 'center' }}
        >
          ▶
        </button>
      )}

      {/* Main Navigation */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {!isCollapsed && (
          <div style={{ fontSize: '11px', color: '#8b949e', padding: '8px 12px', textTransform: 'uppercase', fontWeight: 600 }}>
            Main
          </div>
        )}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isCollapsed ? '12px' : '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: pathname === item.href ? '#2f81f7' : '#8b949e',
              background: pathname === item.href ? 'rgba(47,129,247,0.1)' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              marginBottom: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>}
          </Link>
        ))}

        {!isCollapsed && (
          <div style={{ fontSize: '11px', color: '#8b949e', padding: '16px 12px 8px', textTransform: 'uppercase', fontWeight: 600 }}>
            System
          </div>
        )}
        {secondaryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isCollapsed ? '12px' : '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: pathname === item.href ? '#2f81f7' : '#8b949e',
              background: pathname === item.href ? 'rgba(47,129,247,0.1)' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              marginBottom: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* User */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#2f81f7,#a371f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '12px',
          color: '#fff',
        }}>
          D
        </div>
        {!isCollapsed && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0f6fc' }}>Deva</div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>Pro Plan</div>
          </div>
        )}
      </div>
    </div>
  );
}
