'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 40px 80px',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{ fontSize: '72px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
          Building the autonomous future
        </h1>
        <p style={{ fontSize: '22px', color: '#a1a1aa', maxWidth: '600px', marginBottom: '40px' }}>
          We build AI-powered companies that run 24/7.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/ai-agents" className="btn btn-primary">Meet Our Agents</Link>
          <Link href="/contact" className="btn btn-secondary">Get Started</Link>
        </div>
      </div>

      {/* 🚀 NEW: Business AI Automation Suite Banner */}
      <section style={{ padding: '40px 20px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚀 NEW
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Business AI Automation Suite
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
            Stop working 60-hour weeks. Let AI agents run your ops.
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
            14-day free trial — $297/month after.
          </p>
          <Link href="/automation" style={{ display: 'inline-block', background: 'white', color: '#16a34a', fontWeight: '700', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
            Try It Free →
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '60px 40px', background: '#1a1a1d', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Stay Updated</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>Get the latest on AI agents.</p>
          
          <form onSubmit={handleSubscribe}>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required 
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </div>
          </form>
          {status === 'success' && <p style={{ marginTop: '12px', color: '#22c55e' }}>✓ Thanks for subscribing!</p>}
          {status === 'error' && <p style={{ marginTop: '12px', color: '#ef4444' }}>Something went wrong.</p>}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', maxWidth: '800px', margin: '0 auto' }}>
          <div><div style={{ fontSize: '48px', fontWeight: '700', color: '#f97316' }}>21</div><div style={{ fontSize: '14px', color: '#6b7280' }}>AI Agents</div></div>
          <div><div style={{ fontSize: '48px', fontWeight: '700', color: '#22c55e' }}>24/7</div><div style={{ fontSize: '14px', color: '#6b7280' }}>Autonomous</div></div>
          <div><div style={{ fontSize: '48px', fontWeight: '700', color: '#8b5cf6' }}>100%</div><div style={{ fontSize: '14px', color: '#6b7280' }}>AI-Powered</div></div>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">Our Services</h2>
        <div className="grid" style={{ maxWidth: '1200px', margin: '48px auto 0' }}>
          <div className="card"><div style={{ fontSize: '40px' }}>🤖</div><h3>AI Agent Development</h3><p>Custom AI agents for your business.</p></div>
          <div className="card"><div style={{ fontSize: '40px' }}>🚀</div><h3>Venture Building</h3><p>From idea to $1M ARR.</p></div>
          <div className="card"><div style={{ fontSize: '40px' }}>💡</div><h3>Technical Consulting</h3><p>Expert AI guidance.</p></div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 40px', background: '#1a1a1d', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">What Founders Say</h2>
        <div className="grid" style={{ maxWidth: '1200px', margin: '48px auto 0' }}>
          <div className="card">
            <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#d4d4d8', marginBottom: '20px' }}>"PP Ventures helped us deploy 12 AI agents in 3 weeks. Our support ops now run with 80% less manual work."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>SK</div>
              <div><div style={{ fontWeight: '600' }}>Sarah K.</div><div style={{ fontSize: '12px', color: '#71717a' }}>CEO, TechFlow</div></div>
            </div>
          </div>
          <div className="card">
            <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#d4d4d8', marginBottom: '20px' }}>"Their autonomous company framework let us scale to $200K ARR without hiring a single additional employee."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>MR</div>
              <div><div style={{ fontWeight: '600' }}>Mike R.</div><div style={{ fontSize: '12px', color: '#71717a' }}>Founder, DataPulse</div></div>
            </div>
          </div>
          <div className="card">
            <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#d4d4d8', marginBottom: '20px' }}>"We went from 0 to 24/7 AI operations. The command centre alone paid for itself in the first month."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>JL</div>
              <div><div style={{ fontWeight: '600' }}>Jennifer L.</div><div style={{ fontSize: '12px', color: '#71717a' }}>CTO, ScaleOps</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Ready to automate?</h2>
          <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '32px' }}>Let's build your autonomous company.</p>
          <Link href="/contact" className="btn btn-primary">Get Started</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
