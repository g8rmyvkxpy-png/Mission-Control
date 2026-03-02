'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  plan: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#030712', color: '#f0f6fc', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#030712', color: '#f0f6fc' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: '240px', transition: 'margin-left 0.2s ease' }}>
        {/* Top Bar */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: '240px',
          height: '60px',
          background: '#0f1117',
          borderBottom: '1px solid #21262d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/tasks" style={{ padding: '8px 16px', background: '#2f81f7', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
              + New Task
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '18px' }}>
              🚪
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ padding: '84px 24px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
