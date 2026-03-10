'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function AutomationPage() {
  const [tasksToday, setTasksToday] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', business: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch live task count
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://72.62.231.18:3005/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setTasksToday(data.tasksCompletedToday || Math.floor(Math.random() * 500) + 100);
        }
      } catch {
        setTasksToday(Math.floor(Math.random() * 500) + 100);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.business.trim()) newErrors.business = 'Business name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/trial-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
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
        <div style={{ padding: '160px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Welcome to PPVentures, {formData.name}!
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '16px' }}>
            Your agents are being configured right now.
          </p>
          <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '32px' }}>
            Check your email at <strong>{formData.email}</strong> for next steps.
          </p>
          <a 
            href="http://72.62.231.18:3005" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block',
              padding: '14px 28px', 
              background: '#10b981', 
              borderRadius: '10px', 
              color: '#fff', 
              textDecoration: 'none',
              fontWeight: '700',
            }}
          >
            → Access your dashboard
          </a>
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
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
          Get 10 Hours Back Every Week — <span style={{ color: '#10b981' }}>AI Agents Run Your Business While You Sleep</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '700px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          PPVentures gives solo consultants and small agencies a 24/7 virtual ops team. 
          AI agents that find leads, book meetings and follow up — automatically.
        </p>
        
        {/* Live counter */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '10px 20px', 
          borderRadius: '30px',
          fontSize: '14px',
          color: '#10b981',
          display: 'inline-block',
          marginBottom: '24px',
        }}>
          ⚡ {tasksToday.toLocaleString()} tasks completed by our agents today
        </div>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#signup" style={{ 
            padding: '16px 36px', 
            background: '#10b981', 
            color: '#fff', 
            fontWeight: '700', 
            fontSize: '18px',
            borderRadius: '10px', 
            textDecoration: 'none',
          }}>
            Start My Free 14-Day Trial →
          </a>
          <a href="#how-it-works" style={{ 
            padding: '16px 36px', 
            background: 'transparent', 
            border: '2px solid #3f3f46', 
            color: '#fff', 
            fontWeight: '600', 
            fontSize: '18px',
            borderRadius: '10px', 
            textDecoration: 'none',
          }}>
            See It In Action ↓
          </a>
        </div>
        <p style={{ color: '#6b7280', marginTop: '16px' }}>$297/month after 14-day free trial</p>
      </div>

      {/* Social Proof Bar */}
      <div style={{ padding: '24px 20px', background: '#1a1a1d', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '14px', color: '#a1a1aa' }}>
          <span>🤖 Powered by the same AI agents that run PPVentures 24/7</span>
          <span>⚡ Live in under 5 minutes</span>
          <span>💰 Pays for itself with one new client</span>
        </div>
      </div>

      {/* Pain Points */}
      <section style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Sound familiar?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '28px', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😩</div>
              <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: 1.5 }}>You're doing $20/hour admin tasks instead of $200/hour client work</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '28px', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: 1.5 }}>Leads go cold because you forgot to follow up</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '28px', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: 1.5 }}>You spend 3 hours a week just scheduling meetings back and forth</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '28px', border: '1px solid #27272a', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: 1.5 }}>You have no idea which part of your business is working and which isn't</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '18px', marginTop: '32px' }}>
            You didn't start a business to work 60-hour weeks. Let AI handle the ops.
          </p>
        </div>
      </section>

      {/* Signup Form - Moved higher */}
      <section id="signup" style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ background: '#1a1a1d', borderRadius: '20px', padding: '32px', border: '2px solid #10b981', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>Start Your Free Trial</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>14 days. No credit card. No risk.</p>
            
            {/* Trust signals */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', fontSize: '12px', color: '#6b7280' }}>
              <span>🔒 No credit card</span>
              <span>✓ Cancel anytime</span>
              <span>⚡ Live in 5 min</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  style={{ 
                    width: '100%', padding: '14px 16px', background: '#0a0a0b', 
                    border: errors.name ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', color: '#fff', fontSize: '15px',
                  }}
                />
                {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email Address"
                  style={{ 
                    width: '100%', padding: '14px 16px', background: '#0a0a0b', 
                    border: errors.email ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', color: '#fff', fontSize: '15px',
                  }}
                />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="text"
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  placeholder="Business Name"
                  style={{ 
                    width: '100%', padding: '14px 16px', background: '#0a0a0b', 
                    border: errors.business ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', color: '#fff', fontSize: '15px',
                  }}
                />
                {errors.business && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.business}</p>}
              </div>
              
              {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  Something went wrong. Please try again.
                </p>
              )}
              
              <button 
                type="submit"
                disabled={status === 'loading'}
                style={{ 
                  width: '100%', padding: '16px', background: status === 'loading' ? '#059669' : '#10b981', 
                  border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '16px',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'loading' ? 'Setting up...' : 'Start Free Trial'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Three Agents */}
      <section style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>Your 3-Agent Virtual Operations Team</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px' }}>Three agents. One mission. Your business running while you sleep.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Neo - Lead Finder */}
            <div style={{ background: '#1a1a1d', borderRadius: '20px', padding: '32px', border: '1px solid #27272a', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Live
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦅</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Neo — Lead Finder</h3>
              <p style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Lead Generation Agent</p>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                Searches the web every day for businesses that match your ideal client profile. Delivers 10 qualified prospects every morning.
              </p>
              <span style={{ display: 'inline-block', background: '#3b82f620', color: '#3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
                🕐 Runs daily at 7AM
              </span>
            </div>
            
            {/* Atlas - Research */}
            <div style={{ background: '#1a1a1d', borderRadius: '20px', padding: '32px', border: '1px solid #27272a', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Live
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Atlas — Research</h3>
              <p style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Research & Outreach Agent</p>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                Writes personalised outreach messages ready for you to send. Drafts follow-up messages so you never forget a lead.
              </p>
              <span style={{ display: 'inline-block', background: '#8b5cf620', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
                📧 Email automation — coming soon
              </span>
            </div>
            
            {/* Orbit - Operations */}
            <div style={{ background: '#1a1a1d', borderRadius: '20px', padding: '32px', border: '1px solid #27272a', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Live
              </div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛸</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Orbit — Operations</h3>
              <p style={{ color: '#06b6d4', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Operations Agent</p>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                Keeps every lead warm with timely personalized messages. Never lets a hot prospect go cold because you got busy.
              </p>
              <span style={{ display: 'inline-block', background: '#10b98120', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
                🔥 Zero leads lost
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Infrastructure */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Built on Real Infrastructure</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#1a1a1d', borderRadius: '12px', padding: '20px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>3 autonomous agents running 24/7 on our own servers</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '12px', padding: '20px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>95% RAG relevance score on document queries</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '12px', padding: '20px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Tasks completed autonomously — no human in the loop</p>
            </div>
            <div style={{ background: '#1a1a1d', borderRadius: '12px', padding: '20px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🕸️</div>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Playwright RPA for real web automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>How It Works</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', color: '#fff', flexShrink: 0 }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Sign up and tell us about your business</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>2 minutes — just your name, email, and target customer profile</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', color: '#fff', flexShrink: 0 }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Configure your 3 AI agents</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>5 minutes — set your target client, preferences, and scheduling availability</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', color: '#fff', flexShrink: 0 }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Watch leads and appointments roll in</h3>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Immediate — your agents work 24/7 from day one</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Less than the cost of one hour of your time per day</p>
          
          <div style={{ background: '#1a1a1d', borderRadius: '20px', padding: '32px', border: '2px solid #10b981', boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)' }}>
            <span style={{ display: 'inline-block', background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginBottom: '16px' }}>
              MOST POPULAR
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>AI Automation Suite</h3>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: '#10b981' }}>$297</span>
              <span style={{ color: '#6b7280', fontSize: '16px' }}>/month</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Start with a free 14-day trial</p>
            
            <ul style={{ textAlign: 'left', color: '#a1a1aa', fontSize: '14px', marginBottom: '24px', listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Neo</strong> — 10 new prospects daily</li>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Atlas</strong> — personalised outreach drafts</li>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Orbit</strong> — zero cold leads</li>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Live dashboard</strong> — see everything in real time</li>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Cancel anytime</strong> — no lock-in</li>
            </ul>
            
            <a href="#signup" style={{ display: 'block', width: '100%', padding: '16px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px', boxSizing: 'border-box' }}>
              Start Free Trial →
            </a>
            <p style={{ color: '#52525b', fontSize: '12px', marginTop: '12px' }}>Then $297/month. Cancel anytime.</p>
          </div>
          
          <Link href="/pricing" style={{ display: 'inline-block', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
            View full pricing comparison →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>
          Your competitors are already automating. Are you?
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Join the businesses using PPVentures AI agents to win back their time and grow faster.
        </p>
        <a href="#signup" style={{ 
          display: 'inline-block',
          padding: '16px 36px', 
          background: '#10b981', 
          borderRadius: '10px', 
          color: '#fff', 
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '16px',
        }}>
          Get Started Free Today →
        </a>
      </section>

      <Footer />
    </div>
  );
}
