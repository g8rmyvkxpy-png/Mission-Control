'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const searchInputRef = useRef(null);
  const pullRef = useRef(null);
  const [pulling, setPulling] = useState(false);

  // Update last synced time periodically
  useEffect(() => {
    const interval = setInterval(() => setLastSynced(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Bottom nav tabs (mobile main tabs)
  const bottomTabs = [
    { id: 'overview', label: 'Home', icon: '🏠', href: '/dashboard/overview' },
    { id: 'board', label: 'Tasks', icon: '✅', href: '/dashboard/board' },
    { id: 'projects', label: 'Projects', icon: '📋', href: '/dashboard/projects' },
    { id: 'goals', label: 'Goals', icon: '🎯', href: '/dashboard/goals' },
    { id: 'brain', label: 'Brain', icon: '🧠', href: '/dashboard/brain' },
    { id: 'team', label: 'Team', icon: '👥', href: '/dashboard/team' },
  ];

  // Secondary tabs (accessible via More)
  const moreTabs = [
    { id: 'analytics', label: 'Analytics', icon: '📊', href: '/dashboard/analytics' },
    { id: 'memory', label: 'Memory', icon: '💾', href: '/dashboard/memory' },
    { id: 'website', label: 'Website', icon: '🌐', href: '/dashboard/website' },
    { id: 'docs', label: 'Docs', icon: '📄', href: '/dashboard/docs' },
    { id: 'videos', label: 'Videos', icon: '🎬', href: '/dashboard/videos' },
    { id: 'office', label: 'Office', icon: '🏢', href: '/dashboard/office' },
    { id: 'calendar', label: 'Crons', icon: '⏰', href: '/dashboard/calendar' },
  ];

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW error:', err));
    }
    
    // Request push notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      // Will be requested on user interaction
    }
  }, []);

  // Get current tab from pathname
  const getCurrentTab = () => {
    const path = pathname || '';
    for (const tab of [...bottomTabs, ...moreTabs]) {
      if (path.includes(tab.href)) return tab.id;
    }
    return 'overview';
  };

  const currentTab = getCurrentTab();

  // Fetch notifications
  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications?.slice(0, 10) || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    });
    fetchNotifications();
  }

  useEffect(() => {
    fetchNotifications();
    
    const channel = supabase.channel('notifications')
      ?.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      ?.subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === '?' && !e.target?.matches('input, textarea')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowShortcuts(false);
        setShowMobileMenu(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pull to refresh
  const handlePull = async (e) => {
    if (pulling) return;
    setPulling(true);
    // Trigger refresh - emit custom event
    window.dispatchEvent(new CustomEvent('refresh-page'));
    setTimeout(() => setPulling(false), 1000);
  };

  return (
    <div className="app-layout" ref={pullRef}>
      {/* Desktop Header */}
      {!isMobile && (
        <header className="header desktop-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">COMMAND CENTRE</span>
          </div>
          
          <nav className="tabs desktop-nav">
            {[...bottomTabs, ...moreTabs].map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`tab ${currentTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div style={{ fontSize: 10, color: '#666', marginRight: 8 }}>
              Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="search-hint" onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}>
              <span>🔍</span>
              <span className="search-text">Search...</span>
              <kbd>⌘K</kbd>
            </div>
            
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <span>🔔</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>
          </div>
        </header>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="header mobile-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
          </div>
          <div className="mobile-header-title">Command Centre</div>
          <div className="mobile-header-actions">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <span>🔔</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>
            <button className="more-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>☰</button>
          </div>
        </header>
      )}

      {/* Mobile More Menu Drawer */}
      {isMobile && showMobileMenu && (
        <div className="mobile-drawer-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <span>More</span>
              <button onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>
            {moreTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`drawer-item ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="drawer-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className={`container page-content ${isMobile ? 'mobile-content' : ''}`}>
        {pulling && <div className="pull-indicator">↓ Pull to refresh</div>}
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="bottom-nav">
          {bottomTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`bottom-tab ${currentTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          ))}
          <button className="bottom-tab" onClick={() => setShowMobileMenu(true)}>
            <span className="tab-icon">📱</span>
            <span className="tab-label">More</span>
          </button>
        </nav>
      )}

      {/* Global Search Modal */}
      {showSearch && (
        <div className="modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-input-wrap">
              <span>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
              <kbd onClick={() => setShowSearch(false)}>ESC</kbd>
            </div>
            <div className="search-results">
              {searchResults.length === 0 && searchQuery.length > 1 && (
                <div className="no-results">No results</div>
              )}
              {searchResults.map((result, i) => (
                <div key={i} className="search-result-item" onClick={() => { router.push(result.url); setShowSearch(false); }}>
                  <span className="result-icon">{result.icon}</span>
                  <span className="result-badge">{result.sourceLabel}</span>
                  <div className="result-content">
                    <div className="result-title">{result.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <span>🔔 Notifications</span>
            <button onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                  <div className="notification-title">{n.title}</div>
                  {n.message && <div className="notification-message">{n.message}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="modal-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div className="shortcuts-grid">
              <div className="shortcut"><kbd>⌘K</kbd> Global search</div>
              <div className="shortcut"><kbd>?</kbd> Show this help</div>
            </div>
            <button className="close-btn" onClick={() => setShowShortcuts(false)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .app-layout {
          min-height: 100vh;
          background: var(--bg);
        }
        .header {
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 60px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          color: var(--text);
        }
        .logo-icon {
          font-size: 20px;
          animation: logoGlow 3s ease-in-out infinite;
        }
        @keyframes logoGlow {
          0%, 100% { text-shadow: 0 0 10px #10b981; }
          50% { text-shadow: 0 0 20px #10b981, 0 0 30px #10b981; }
        }
        .tabs {
          display: flex;
          gap: 4px;
          margin-left: 30px;
        }
        .tab {
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .tab:hover, .tab.active {
          background: #10b98120;
          color: #10b981;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }
        .search-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 13px;
        }
        .search-hint kbd {
          background: var(--bg-card);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }
        .notification-bell {
          position: relative;
          cursor: pointer;
          padding: 8px;
          font-size: 18px;
        }
        .notification-bell .badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 10px;
          font-weight: 600;
        }
        
        /* Mobile styles */
        .mobile-header {
          justify-content: space-between;
        }
        .mobile-header-title {
          font-weight: 600;
          font-size: 16px;
        }
        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .more-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
        }
        
        .mobile-drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
        }
        .mobile-drawer {
          position: absolute;
          top: 60px;
          right: 0;
          width: 280px;
          background: var(--bg-card);
          border-radius: 16px 0 0 16px;
          padding: 16px;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .drawer-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text);
          transition: background 0.2s;
        }
        .drawer-item:hover, .drawer-item.active {
          background: #10b98120;
          color: #10b981;
        }
        .drawer-icon {
          font-size: 20px;
        }
        
        .mobile-content {
          padding-bottom: 80px;
        }
        
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
        }
        .bottom-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          text-decoration: none;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .bottom-tab.active {
          color: #10b981;
        }
        .tab-icon {
          font-size: 22px;
        }
        .tab-label {
          font-size: 11px;
          font-weight: 500;
        }
        
        .pull-indicator {
          text-align: center;
          padding: 8px;
          color: var(--text-muted);
          font-size: 12px;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 100px;
          z-index: 1000;
        }
        .search-modal, .shortcuts-modal {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 70vh;
          overflow: hidden;
        }
        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .search-input-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--text);
        }
        .search-results {
          max-height: 300px;
          overflow: auto;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }
        .result-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          background: #10b98120;
          color: #10b981;
        }
        
        .notifications-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          width: 320px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          z-index: 200;
          max-height: 400px;
          overflow: auto;
        }
        .notifications-header {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
        }
        .notifications-header button {
          background: none;
          border: none;
          color: #10b981;
          cursor: pointer;
        }
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        .notification-item.unread {
          background: #10b98110;
        }
        
        .shortcuts-modal {
          padding: 24px;
        }
        .shortcuts-grid {
          display: grid;
          gap: 12px;
          margin: 20px 0;
        }
        .shortcut {
          display: flex;
          gap: 8px;
        }
        .shortcut kbd {
          background: var(--bg);
          padding: 4px 8px;
          border-radius: 4px;
        }
        .close-btn {
          width: 100%;
          padding: 12px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .page-content {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
