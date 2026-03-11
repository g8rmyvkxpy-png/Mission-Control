'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    } catch (error) {
      console.error('Subscribe failed:', error);
    }
  };

  return (
    <footer style={{
      padding: '64px 40px 32px',
      borderTop: '1px solid #27272a',
      background: '#0a0a0b',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Brand */}
        <div>
          <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#10b981' }}>◆</span>
            PP<span style={{ color: '#10b981' }}>Ventures</span>
          </h4>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
            Building the autonomous future with AI-powered companies that run 24/7.
          </p>
          
          {/* Social Links */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <a 
              href="https://linkedin.com/company/ppventures" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: '20px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0b65c2'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              LinkedIn
            </a>
            <a 
              href="https://x.com/ppventures" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: '20px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              X
            </a>
            <a 
              href="https://github.com/ppventures" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#6b7280', fontSize: '20px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              GitHub
            </a>
          </div>
        </div>
        
        {/* Product */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/ai-agents" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>AI Agents</Link>
            <Link href="/services" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Services</Link>
            <Link href="/pricing" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/automation" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Automation Suite</Link>
            <Link href="/blog" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Blog</Link>
          </div>
        </div>
        
        {/* Company */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Company</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/about" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>About</Link>
            <Link href="/careers" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Careers <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>We're hiring</span></Link>
            <Link href="/contact" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
        
        {/* Newsletter */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>Get AI Tips Weekly</h4>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
            Get actionable AI insights delivered weekly.
          </p>
          <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" 
              required
              style={{ 
                flex: 1, 
                padding: '10px 12px', 
                fontSize: '13px',
                marginBottom: 0,
                borderRadius: '6px',
              }}
            />
            <button 
              type="submit"
              style={{
                padding: '10px 16px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {subscribed ? '✓' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Bottom */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '48px auto 0', 
        paddingTop: '24px', 
        borderTop: '1px solid #27272a',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
          <Link href="/privacy" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
        <div style={{ fontSize: '13px', color: '#10b981' }}>
          Powered by AI agents 24/7
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '24px', color: '#4b5563', fontSize: '12px' }}>
        © 2026 PPVentures. All rights reserved.
      </div>
    </footer>
  );
}
