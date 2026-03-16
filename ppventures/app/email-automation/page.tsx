'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const features = [
  {
    icon: '📧',
    title: 'Smart Routing',
    desc: 'Automatically categorize and route emails to the right person or folder based on rules you set.'
  },
  {
    icon: '🤖',
    title: 'Auto-Responses',
    desc: 'Send instant, personalized replies to common queries. Never leave a lead waiting.'
  },
  {
    icon: '📊',
    title: 'Daily Digest',
    desc: 'Get a summary of all important emails every morning. Stay informed in 5 minutes.'
  },
  {
    icon: '🔗',
    title: 'CRM Sync',
    desc: 'Automatically add leads to your CRM. Keep everything in one place.'
  },
  {
    icon: '📋',
    title: 'Lead Capture',
    desc: 'Form submissions instantly become tracked leads with follow-up sequences.'
  },
  {
    icon: '⏰',
    title: 'Follow-up Sequences',
    desc: 'Never miss a lead with automated multi-step follow-ups.'
  },
];

const howItWorks = [
  { step: '1', title: 'Connect Your Email', desc: 'Gmail, Outlook, or any IMAP inbox' },
  { step: '2', title: 'Set Rules', desc: 'Define how to categorize and route' },
  { step: '3', title: 'Activate', desc: 'Automation runs 24/7' },
];

const pricing = [
  {
    name: 'Starter',
    price: '$197',
    desc: 'For individuals',
    features: ['Up to 500 emails/month', '3 routing rules', '1 auto-response', 'Daily digest'],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$297',
    popular: true,
    desc: 'For small teams',
    features: ['Unlimited emails', '10 routing rules', '5 auto-responses', 'CRM integration', 'Follow-up sequences', 'Priority support'],
    cta: 'Get Started',
  },
  {
    name: 'Business',
    price: '$497',
    desc: 'For growing businesses',
    features: ['Everything in Pro', 'Unlimited rules', 'Unlimited automations', 'Custom integrations', 'Dedicated support'],
    cta: 'Contact Us',
  },
];

export default function EmailAutomationPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', needs: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
        <AnimatedBackground />
        <Navbar />
        <div style={{ padding: '160px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
            Request Received!
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
            We&apos;ll be in touch within 24 hours.
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
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>📧 Email Automation Product</span>
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
          Your Email,<br/>On Autopilot
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: 'clamp(16px, 2vw, 20px)', 
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Smart email automation that routes, responds, and follows up — so you can focus on actual work.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#pricing" style={{
            padding: '16px 32px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            View Pricing →
          </a>
          <a href="#features" style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            How It Works
          </a>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }} id="features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            What It Does
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            Everything you need to automate your inbox
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {features.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#fff' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {howItWorks.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  background: '#10b981', 
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px', color: '#fff' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#a1a1aa' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }} id="pricing">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Simple Pricing
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            One-time payment. No monthly fees.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {pricing.map((plan, i) => (
              <div key={i} style={{
                background: plan.popular ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                border: plan.popular ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '300px',
                textAlign: 'center',
                position: 'relative'
              }}>
                {plan.popular && (
                  <div style={{ 
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', color: '#fff',
                    padding: '4px 16px', borderRadius: '12px',
                    fontSize: '12px', fontWeight: '700'
                  }}>
                    POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>{plan.name}</h3>
                <div style={{ fontSize: '40px', fontWeight: '800', marginBottom: '8px', color: '#10b981' }}>{plan.price}</div>
                <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>{plan.desc}</p>
                <ul style={{ textAlign: 'left', color: '#a1a1aa', fontSize: '14px', lineHeight: 2, listStyle: 'none', marginBottom: '24px' }}>
                  {plan.features.map((f, j) => (
                    <li key={j}>✓ {f}</li>
                  ))}
                </ul>
                <a href="#contact" style={{
                  display: 'block',
                  padding: '14px',
                  background: plan.popular ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={{ padding: '80px 20px 120px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }} id="contact">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Get Started
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '32px' }}>
            Questions? Let&apos;s chat.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
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
            <div>
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
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
            <div>
              <input
                type="text"
                placeholder="Company (optional)"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
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
            <div>
              <textarea
                placeholder="What do you need? (optional)"
                rows={2}
                value={formData.needs}
                onChange={e => setFormData({...formData, needs: e.target.value})}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical'
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
              {status === 'loading' ? 'Sending...' : 'Submit →'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
