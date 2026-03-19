'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    interest: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: formData.interest || 'general',
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
        <AnimatedBackground />
        <Navbar />
        <div style={{ padding: '160px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
            Message Sent!
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
            We usually reply within 2-4 hours on working days.
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
      <div style={{ padding: '140px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Let&apos;s Talk
        </h1>
        <p style={{
          color: '#a1a1aa',
          fontSize: 'clamp(16px, 2vw, 18px)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Have a process you want automated? Want to see a demo? Just want to chat about AI?
          We&apos;re here.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 20px 80px', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>

          {/* Left: Contact Info */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#fff' }}>
              How to reach us
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  ✉️
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Email</div>
                  <a href="mailto:hello@ppventures.tech" style={{ color: '#10b981', textDecoration: 'none', fontSize: '15px' }}>
                    hello@ppventures.tech
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  💬
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>WhatsApp</div>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontSize: '15px' }}>
                    +91 98765 43210
                  </a>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  📍
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Based in</div>
                  <div style={{ color: '#a1a1aa', fontSize: '15px' }}>India — Working globally</div>
                </div>
              </div>

              {/* Response Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  ⚡
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '2px' }}>Response Time</div>
                  <div style={{ color: '#a1a1aa', fontSize: '15px' }}>2-4 hours on working days</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #27272a', marginTop: '32px', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
                Prefer to self-serve?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/ai-ops" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', textDecoration: 'none', fontSize: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #27272a' }}>
                  <span>📋</span>
                  <span>View services & pricing →</span>
                </Link>
                <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', textDecoration: 'none', fontSize: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #27272a' }}>
                  <span>💳</span>
                  <span>Start free trial →</span>
                </Link>
                <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', textDecoration: 'none', fontSize: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #27272a' }}>
                  <span>📝</span>
                  <span>Read our blog →</span>
                </Link>
              </div>
            </div>

            {/* UPI Quick Pay */}
            <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                🔥 Instant Consultation — ₹1,000
              </div>
              <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '14px', lineHeight: 1.5 }}>
                30-minute video call. Pay via UPI and we&apos;ll send you a scheduling link within the hour.
              </p>
              <a
                href="upi://pay?pa=ppventures@ybl&pn=PPVentures&am=1000&cu=INR"
                style={{
                  display: 'block',
                  padding: '12px',
                  background: '#10b981',
                  borderRadius: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                Pay ₹1,000 via UPI →
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            <div style={{
              background: '#1a1a1d',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #27272a'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
                Send us a message
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
                We read every message. No spam, ever.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#a1a1aa' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Rahul Kumar"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#0a0a0b',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#a1a1aa' }}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@company.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#0a0a0b',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#a1a1aa' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Your company name (optional)"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#0a0a0b',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#a1a1aa' }}>
                    Message *
                  </label>
                  <textarea
                    placeholder="Tell us what you're working on, what you want to automate, or just say hi..."
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#0a0a0b',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    padding: '16px 24px',
                    background: status === 'loading' ? '#71717a' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message →'}
                </button>

                {status === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>
                    Something went wrong. Please email us directly at hello@ppventures.tech
                  </p>
                )}

                <p style={{ color: '#52525b', fontSize: '11px', textAlign: 'center' }}>
                  Or email us directly at hello@ppventures.tech — we respond to every email.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
