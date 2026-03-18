'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function StarterPackPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Capture lead for Starter Pack purchase
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: email,
          company: '',
          product: 'Starter Pack',
          source: 'starter-pack-page'
        })
      });
      
      // Also subscribe to newsletter
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      setStatus('success');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('success'); // Still show success to not block user
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
        <AnimatedBackground />
        <Navbar />
        <div style={{ padding: '160px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
            You're In!
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
            Check your email for payment details.<br/>
            WhatsApp us after payment: +91 [YOUR NUMBER]
          </p>
          <Link href="/" style={{ color: '#10b981', textDecoration: 'underline' }}>
            ← Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ padding: '140px 20px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '8px 16px', 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>⚡ Instant Download</span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(32px, 6vw, 56px)', 
          fontWeight: '800', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Email Automation<br/>Starter Pack
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: 'clamp(16px, 2vw, 20px)', 
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Everything you need to start automating your inbox. 
          Instant download after payment.
        </p>

        <div style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#10b981',
          marginBottom: '32px'
        }}>
          ₹2,999
        </div>
        
        <a href="#buy" style={{
          display: 'inline-block',
          padding: '18px 40px',
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '18px',
          textDecoration: 'none',
        }}>
          Buy Now →
        </a>
      </div>

      {/* What's Included */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }} id="includes">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#fff' }}>
            What's Included
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '📋', title: 'Email Automation Checklist', desc: '20 questions to identify exactly what to automate' },
              { icon: '📖', title: 'Setup Guide', desc: 'Step-by-step guide to set up your first automation' },
              { icon: '🎯', title: 'Zapier Templates', desc: '5 pre-built Zapier workflows ready to use' },
              { icon: '⚡', title: 'n8n Workflows', desc: '3 automation workflows you can import directly' },
              { icon: '📊', title: 'ROI Calculator', desc: 'Calculate your time savings from automation' },
              { icon: '💬', title: 'Support Access', desc: '30-min call to help you implement' },
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '36px' }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center', color: '#fff' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { step: '1', title: 'Buy Now', desc: 'Pay ₹2,999 via UPI or transfer' },
              { step: '2', title: 'Get Instant Access', desc: 'Download links sent to your email' },
              { step: '3', title: 'Start Automating', desc: 'Follow the guides to set up your first automation' },
              { step: '4', title: 'Save 10+ Hours/Week', desc: 'Watch your inbox sort itself' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  background: '#10b981', 
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{item.title}</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buy */}
      <div style={{ padding: '80px 20px 120px', position: 'relative', zIndex: 1 }} id="buy">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Get Instant Access
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '32px' }}>
            Pay via UPI: <strong style={{color:'#fff'}}>ppventures@upi</strong><br/>
            Or bank transfer (WhatsApp for details)
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '18px',
                background: status === 'loading' ? '#71717a' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? 'Sending...' : 'I\'ve Paid - Send Download Link →'}
            </button>
          </form>
          
          <p style={{ color: '#71717a', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            After payment, WhatsApp receipt to: +91 [YOUR NUMBER]
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
