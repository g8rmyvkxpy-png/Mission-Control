'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes that should NOT show sidebar
  const noSidebarRoutes = ['/login', '/landing', '/pricing'];
  const showSidebar = !noSidebarRoutes.some(route => pathname === route);

  return (
    <>
      {showSidebar && <Sidebar />}
      <div style={{
        marginLeft: showSidebar ? '240px' : '0',
        minHeight: '100vh',
        background: '#030712',
        transition: 'margin-left 0.2s ease'
      }}>
        {children}
      </div>
    </>
  );
}
