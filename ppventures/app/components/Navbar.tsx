'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/ai-ops', label: 'AI Ops' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 40px',
      position: 'sticky',
      top: 0,
      width: '100%',
      background: 'rgba(10, 10, 11, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #27272a',
      zIndex: 1000,
    }}>
      {/* Logo */}
      <Link href="/" style={{ fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#10b981', fontSize: '18px' }}>◆</span>
        PP<span style={{ color: '#10b981' }}>Ventures</span>
      </Link>
      
      {/* Desktop Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
        <div style={{ display: 'flex', gap: '24px' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              style={{ 
                color: isActive(link.href) ? '#10b981' : '#a1a1aa', 
                textDecoration: 'none',
                fontWeight: isActive(link.href) ? '600' : '500',
                fontSize: '14px',
                position: 'relative',
                padding: '4px 0',
              }}
            >
              {link.label}
              {isActive(link.href) && (
                <span style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: '#10b981',
                  borderRadius: '1px',
                }} />
              )}
            </Link>
          ))}
        </div>
        
        {/* Start Free Trial Button */}
        <Link href="/ai-ops#contact" style={{
          padding: '10px 20px',
          background: '#10b981',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}>
          Get Started
        </Link>
        
        <SignedIn>
          <Link href="/mission-control/performance" style={{
            padding: '10px 16px',
            background: '#f97316',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
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
              background: 'transparent',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile hamburger */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
        }}
        className="mobile-toggle"
      >
        <div style={{ width: '24px', height: '2px', background: '#fff', marginBottom: '6px' }} />
        <div style={{ width: '24px', height: '2px', background: '#fff', marginBottom: '6px' }} />
        <div style={{ width: '24px', height: '2px', background: '#fff' }} />
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 11, 0.98)',
          backdropFilter: 'blur(16px)',
          padding: '24px',
          borderBottom: '1px solid #27272a',
        }} className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  color: isActive(link.href) ? '#10b981' : '#a1a1aa', 
                  textDecoration: 'none',
                  fontWeight: isActive(link.href) ? '600' : '500',
                  fontSize: '16px',
                  padding: '8px 0',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/ai-ops#contact" onClick={() => setMobileMenuOpen(false)} style={{
              padding: '14px 20px',
              background: '#10b981',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              textAlign: 'center',
              marginTop: '8px',
            }}>
              Get Started
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
