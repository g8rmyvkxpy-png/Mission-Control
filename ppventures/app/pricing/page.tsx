'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const faqs = [
  {
    q: 'What happens after the 14-day trial?',
    a: "You'll be charged ₹25,000 for your first month. You can cancel anytime before that — no charge, no questions. We'll send you a reminder before the trial ends.",
  },
  {
    q: 'How long does setup take?',
    a: 'About 5 minutes. You tell us your niche and target audience, and we configure your agents. They start working the same day.',
  },
  {
    q: 'Do I need any technical knowledge?',
    a: 'No. Everything runs in our dashboard. You will get a daily email summary of what your agents did. If you want to dig deeper, the dashboard shows full activity logs.',
  },
  {
    q: 'Can I customise what the agents do?',
    a: 'Yes. You set your target client profile, your preferred outreach tone, which competitors to monitor, and which news sources to track. We handle the rest.',
  },
  {
    q: 'What if the leads are not relevant to my business?',
    a: 'During setup, you define your ideal client in detail. Neo uses that profile to qualify every lead. If the results are not hitting the mark, we will re-configure for free.',
  },
  {
    q: 'Do the agents send emails on my behalf?',
    a: 'Not yet — that is coming soon. Right now, Neo drafts the outreach messages and you review and send them. This actually works well because you maintain control over what goes out under your name.',
  },
  {
    q: 'What data do you collect? Is my business data safe?',
    a: 'Your data is stored in Supabase with encryption at rest and in transit. We never share your data with other clients. We never use your data to train AI models. See our privacy policy for full details.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no lock-in. Cancel from your dashboard or email us. Your data is deleted within 30 days of cancellation.',
  },
  {
    q: 'Is ₹25,000/month worth it?',
    a: 'If you bill $150/hr and our agents save you even 2 hours per month, the product has paid for itself. Most clients report saving 8-10 hours per week.',
  },
];

export default function PricingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: '',
    niche: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.business || !formData.niche) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/trial-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', business: '', niche: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <section style={{ padding: '160px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '700', marginBottom: '16px' }}>
          One plan. Everything included.
        </h1>
        <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '500px', margin: '0 auto' }}>
          No tiers to compare. No features locked behind upgrades. You get all three agents, all capabilities, from day one.
        </p>
      </section>

      {/* Pricing Card */}
      <section style={{ padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: '#1a1a1d', borderRadius: '24px', padding: '40px', border: '2px solid #10b981' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>PPVentures Automation Suite</h2>
          <p style={{ color: '#10b981', fontSize: '56px', fontWeight: '800', marginBottom: '8px' }}>₹25,000<span style={{ fontSize: '20px', fontWeight: '400' }}>/month</span></p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>After a free 14-day trial. Cancel anytime.</p>
          
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            {[
              'Neo — 10+ qualified leads daily with outreach drafts',
              'Atlas — Competitor monitoring + industry news + research',
              'Orbit — Daily reports + task tracking + system monitoring',
              'Live dashboard — See all agent activity in real time',
              'Document Q&A — Ask questions about your own files using RAG',
              'Web scraping — Automated data extraction via Playwright',
              'Scheduled tasks — Run any workflow on a cron schedule',
              'Email support — We respond within 24 hours',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < 7 ? '1px solid #27272a' : 'none' }}>
                <span style={{ color: '#10b981' }}>✓</span>
                <span style={{ color: '#d4d4d8' }}>{item}</span>
              </div>
            ))}
          </div>

          <a href="#signup" style={{ display: 'block', padding: '18px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '18px', textAlign: 'center', marginBottom: '16px' }}>
            Start Your Free 14-Day Trial →
          </a>
          <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>No credit card required. Cancel anytime. Takes 5 minutes to set up.</p>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {status === 'success' ? (
            <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#10b981', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>You're in!</p>
              <p style={{ color: '#a1a1aa' }}>Check your inbox for next steps. Your free trial starts now.</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Start your free trial</h2>
              <form onSubmit={handleSubmit} style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Full name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Email address *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="john@company.com" style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Business name *</label>
                  <input type="text" value={formData.business} onChange={(e) => setFormData({...formData, business: e.target.value})} required placeholder="Your company name" style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Your niche / target client *</label>
                  <textarea value={formData.niche} onChange={(e) => setFormData({...formData, niche: e.target.value})} required placeholder="e.g. I'm a freelance web developer targeting local restaurants that need websites" rows={3} style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px', resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={status === 'loading'} style={{ width: '100%', padding: '16px 24px', background: '#10b981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}>
                  {status === 'loading' ? 'Creating account...' : 'Start Free Trial →'}
                </button>
                
                {/* Instant Pay Option */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
                  <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>Or pay instantly via UPI</p>
                  <a href="upi://pay?pa=ppventures@ybl&pn=PPVentures&am=500" style={{ display: 'block', padding: '12px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', textAlign: 'center', textDecoration: 'none', border: '1px solid #10b981' }}>
                    📱 Pay ₹500 via UPI
                  </a>
                  <p style={{ color: '#6b7280', fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>Google Pay, PhonePe, Paytm accepted</p>
                </div>
                {status === 'error' && (
                  <p style={{ color: '#ef4444', marginTop: '12px', textAlign: 'center' }}>Something went wrong. Please try again.</p>
                )}
              </form>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
                <summary style={{ padding: '20px', cursor: 'pointer', fontWeight: '600', color: '#fff', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ color: '#10b981' }}>▼</span>
                </summary>
                <div style={{ padding: '0 20px 20px', color: '#a1a1aa', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
