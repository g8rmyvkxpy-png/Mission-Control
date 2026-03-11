'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const agents = [
  {
    name: 'Neo',
    role: 'Lead Agent',
    icon: '🦅',
    description: 'Searches the web every day for businesses that match your ideal client profile. It finds leads, qualifies them, and drafts personalised outreach messages — all before you wake up.',
    delivers: ['10 qualified leads matching your niche', 'Personalised outreach message for each lead', 'Lead source and qualification reasoning'],
    tech: 'Minimax M2.5 · Playwright RPA · Supabase',
    status: 'Live 24/7',
  },
  {
    name: 'Atlas',
    role: 'Research Agent',
    icon: '🗺️',
    description: 'Handles deep research — competitor monitoring, industry news, market analysis, and document summarisation. It watches your competitors daily and flags anything that changes.',
    delivers: ['Competitor change alerts', 'Morning industry news digest', 'Research summaries on demand'],
    tech: 'Minimax M2.5 · Supabase',
    status: 'Live 24/7',
  },
  {
    name: 'Orbit',
    role: 'Operations Agent',
    icon: '🛸',
    description: 'Runs your operational tasks — scheduling, monitoring, reporting, system health checks, and end-of-day performance summaries. It keeps everything running so nothing falls through the cracks.',
    delivers: ['Evening performance report', 'Task completion summaries', 'System health monitoring'],
    tech: 'Minimax M2.5 · Supabase',
    status: 'Live 24/7',
  },
];

const howItWorks = [
  { step: '1', title: 'Tell us who your ideal client is', desc: 'Your niche, your target audience, your preferences. 2 minutes.' },
  { step: '2', title: 'We configure Neo, Atlas and Orbit', desc: 'Your agents are customized and deployed. No technical setup.' },
  { step: '3', title: 'Wake up to leads, outreach, and reports', desc: 'From day one, your agents are working for you.' },
];

const roadmap = [
  '📧 Email sending integration',
  '🔗 LinkedIn automation',
  '📅 Calendar and meeting booking',
  '🔌 CRM integration (HubSpot, Pipedrive)',
  '🤖 More specialised agents',
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [sampleName, setSampleName] = useState('');
  const [sampleEmail, setSampleEmail] = useState('');
  const [sampleNiche, setSampleNiche] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sampleStatus, setSampleStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleSampleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleName || !sampleEmail || !sampleNiche) return;
    setSampleStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sampleName,
          email: sampleEmail,
          message: `Free lead report request. Niche: ${sampleNiche}`,
          service: 'sample-report',
        }),
      });
      
      if (res.ok) {
        setSampleStatus('success');
        setSampleName('');
        setSampleEmail('');
        setSampleNiche('');
        setTimeout(() => setSampleStatus('idle'), 3000);
      } else {
        setSampleStatus('error');
      }
    } catch {
      setSampleStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ padding: '180px 20px 120px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', maxWidth: '900px', margin: '0 auto 24px' }}>
          Your leads found. Your outreach written. Your follow-ups handled. Every single day.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          PPVentures deploys 3 AI agents that run your lead gen and outreach 24/7 — so you can focus on the work that actually pays. <strong style={{ color: '#10b981' }}>$297/mo</strong>. 14-day free trial.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="#sample-report" style={{ padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
            Get a Free Sample Report →
          </a>
          <a href="#agents" style={{ padding: '16px 32px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            See what the agents do ↓
          </a>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          No credit card required · Cancel anytime · Live in under 5 minutes
        </p>
      </section>

      {/* Pain Points */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>Sound familiar?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            "You spend Monday morning finding leads instead of serving clients.",
            "Warm prospects go cold because you forgot to follow up on Thursday.",
            "You're doing $20/hr admin when you should be doing $200/hr strategy.",
          ].map((point, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a' }}>
              <p style={{ fontSize: '18px', color: '#d4d4d8', lineHeight: 1.5 }}>{point}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '20px', color: '#fff', fontWeight: '600' }}>You didn't start a business to work 60-hour weeks.</p>
      </section>

      {/* Meet Your 3 Agents */}
      <section id="agents" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
          Three AI agents. Working for you. Right now.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
          {agents.map((agent, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '20px', padding: '40px', border: '1px solid #27272a', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                {agent.status}
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px' }}>{agent.icon}</div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{agent.name} — {agent.role}</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: 1.6 }}>{agent.description}</p>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#fff', fontWeight: '600', marginBottom: '8px' }}>What {agent.name} delivers daily:</p>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa' }}>
                  {agent.delivers.map((item, j) => (
                    <li key={j} style={{ marginBottom: '4px' }}>• {item}</li>
                  ))}
                </ul>
              </div>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Tech: {agent.tech}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>Live in 5 minutes. Not an exaggeration.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {howItWorks.map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Sample Report CTA */}
      <section id="sample-report" style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '16px' }}>See it work before you sign up.</h2>
          <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '32px' }}>
            Tell us your niche. Neo will find 10 leads for you — free. Delivered to your inbox within 24 hours. No account needed.
          </p>
          
          {sampleStatus === 'success' ? (
            <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '12px', padding: '24px' }}>
              <p style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>✓ You're in! Check your inbox for your lead report.</p>
            </div>
          ) : (
            <form onSubmit={handleSampleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>Your name</label>
                <input type="text" value={sampleName} onChange={(e) => setSampleName(e.target.value)} required placeholder="John Doe" style={{ width: '100%', padding: '14px 16px', background: '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>Email address</label>
                <input type="email" value={sampleEmail} onChange={(e) => setSampleEmail(e.target.value)} required placeholder="john@company.com" style={{ width: '100%', padding: '14px 16px', background: '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: 'white' }}>Your niche / target client</label>
                <textarea value={sampleNiche} onChange={(e) => setSampleNiche(e.target.value)} required placeholder="e.g. I'm a freelance web developer targeting local restaurants that need websites" rows={3} style={{ width: '100%', padding: '14px 16px', background: '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px', resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={sampleStatus === 'loading'} style={{ padding: '16px 24px', background: '#10b981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', opacity: sampleStatus === 'loading' ? 0.7 : 1 }}>
                {sampleStatus === 'loading' ? 'Sending...' : 'Get My Free Lead Report →'}
              </button>
              <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>No credit card. No account. Just proof that it works.</p>
            </form>
          )}
        </div>
      </section>

      {/* Pricing Preview */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>One plan. Everything included.</h2>
          <p style={{ color: '#10b981', fontSize: '48px', fontWeight: '800', marginBottom: '8px' }}>$297<span style={{ fontSize: '20px', fontWeight: '400' }}>/month</span></p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>After a free 14-day trial. Cancel anytime.</p>
          
          <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a', textAlign: 'left', marginBottom: '24px' }}>
            {[
              'Neo: 10 qualified leads daily + outreach drafts',
              'Atlas: Competitor monitoring + industry news',
              'Orbit: Daily reports + task tracking',
              'Live dashboard — see agents in real time',
              'Email support',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < 4 ? '1px solid #27272a' : 'none' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: '#d4d4d8' }}>{item}</span>
              </div>
            ))}
          </div>
          
          <a href="/pricing" style={{ display: 'inline-block', padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
            Start Free Trial →
          </a>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Prices in USD. No setup fee. No contracts.</p>
        </div>
      </section>

      {/* Honest Roadmap */}
      <section style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '16px' }}>What we're building next.</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>We believe in showing you what's real and what's coming.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {roadmap.map((item, i) => (
              <div key={i} style={{ background: '#1a1a1d', borderRadius: '8px', padding: '14px 20px', border: '1px solid #27272a', color: '#a1a1aa', fontSize: '15px' }}>
                {item}
              </div>
            ))}
          </div>
          
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Want to influence what we build next? <a href="/contact" style={{ color: '#10b981' }}>Tell us →</a>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '24px' }}>Your competitors are already automating. Let's get you caught up.</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/pricing" style={{ padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
            Start Free Trial — $297/mo
          </a>
          <a href="#sample-report" style={{ padding: '16px 32px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            Get a Free Sample Report First
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
