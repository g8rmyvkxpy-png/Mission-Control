'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      borderBottom: '1px solid #27272a',
      position: 'fixed',
      width: '100%',
      top: 0,
      background: 'rgba(10, 10, 11, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
    }}>
      <Link href="/" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
        PP<span style={{ color: '#f97316' }}>Ventures</span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Home</Link>
          <Link href="/ai-agents" style={{ color: '#a1a1aa', textDecoration: 'none' }}>AI Agents</Link>
          <Link href="/services" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Services</Link>
          <Link href="/pricing" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/about" style={{ color: '#a1a1aa', textDecoration: 'none' }}>About</Link>
          <Link href="/blog" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Blog</Link>
          <Link href="/contact" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Contact</Link>
        </div>
        
        <SignedIn>
          <Link href="/mission-control/performance" style={{
            padding: '10px 20px',
            background: '#f97316',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
            marginRight: '12px',
          }}>
            🚀 Mission Control
          </Link>
          <UserButton afterSignOutUrl="/" appearance={{
            elements: { avatarBox: { width: 36, height: 36 } }
          }}/>
        </SignedIn>
        
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{
              padding: '10px 20px',
              background: '#f97316',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
