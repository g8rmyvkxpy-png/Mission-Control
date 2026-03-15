'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function AIOpsPage() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    company: '',
    process: '',
    budget: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
  };

  const offerings = [
    {
      icon: '📧',
      title: 'Email & Communication',
      desc: 'Auto-replies, follow-ups, summarization, and routing'
    },
    {
      icon: '📊',
      title: 'Report Generation',
      desc: 'Pull data from APIs and generate reports automatically'
    },
    {
      icon: '🔗',
      title: 'App Integrations',
      desc: 'Connect your tools: CRM, Slack, Notion, Google Sheets'
    },
    {
      icon: '🤖',
      title: 'AI Workflows',
      desc: 'Custom automations that handle repetitive tasks'
    },
    {
      icon: '📅',
      title: 'Meeting Automation',
      desc: 'Scheduling, summaries, and follow-up actions'
    },
    {
      icon: '💼',
      title: 'Process Automation',
      desc: 'End-to-end workflow automation with n8n'
    }
  ];

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
            We&apos;ll be in touch within 24 hours to discuss your automation needs.
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
        <h1 style={{ 
          fontSize: 'clamp(36px, 6vw, 64px)', 
          fontWeight: '800', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          AI Automation Services
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: 'clamp(16px, 2vw, 20px)', 
          maxWidth: '600px',
          margin: '0 auto 32px',
          lineHeight: 1.6
        }}>
          Custom automations built with n8n. We handle the tech — 
          you focus on growth. Starting at $500 per automation.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#contact" style={{
            padding: '16px 32px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            Get Free Audit →
          </a>
          <a href="#how-it-works" style={{
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

      {/* Offerings */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }} id="offerings">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Our Services
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            What we can automate for you
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {offerings.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s'
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
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }} id="how-it-works">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#fff' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { step: '01', title: 'Discovery Call', desc: 'Tell us what tasks eat up your time. We identify what can be automated.' },
              { step: '02', title: 'We Build It', desc: 'Custom automation built in 3-7 days using n8n. We test with your real data.' },
              { step: '03', title: 'You Save Time', desc: 'Wake up to completed work every day. We provide 30-day support.' }
            ].map((item, i) => (
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
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Pricing
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            Simple, transparent pricing. No hidden fees.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '300px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>One-Off</h3>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#10b981' }}>$500-3K</div>
              <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>per automation</p>
              <ul style={{ textAlign: 'left', color: '#a1a1aa', fontSize: '14px', lineHeight: 2, listStyle: 'none' }}>
                <li>✓ Single process automation</li>
                <li>✓ Setup & configuration</li>
                <li>✓ 30-day support</li>
                <li>✓ Training walkthrough</li>
              </ul>
            </div>
            
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '300px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#10b981', color: '#fff',
                padding: '4px 16px', borderRadius: '12px',
                fontSize: '12px', fontWeight: '700'
              }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Retainer</h3>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#10b981' }}>$2K-10K</div>
              <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>per month</p>
              <ul style={{ textAlign: 'left', color: '#a1a1aa', fontSize: '14px', lineHeight: 2, listStyle: 'none' }}>
                <li>✓ Ongoing automations</li>
                <li>✓ New builds included</li>
                <li>✓ Priority support</li>
                <li>✓ Scaling as you grow</li>
                <li>✓ Maintenance included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            Everything you need to know
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'How long does it take to build an automation?', a: 'Most automations are built in 3-7 days. Complex workflows may take 2 weeks.' },
              { q: 'What tools do you use?', a: 'We primarily use n8n for workflow automation, combined with OpenAI for AI-powered tasks.' },
              { q: 'Do I need technical knowledge?', a: 'No. We handle all the technical setup. You just tell us what you want to automate.' },
              { q: 'What if something breaks?', a: 'One-off builds include 30-day support. Retainers include ongoing maintenance at no extra cost.' },
              { q: 'Can you integrate with my existing tools?', a: 'Yes. We connect with 50+ tools including CRM, email, Slack, Google Sheets, and more.' },
              { q: 'How does the retainer work?', a: 'Pay monthly for ongoing automation needs. Includes new builds, updates, and priority support.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
                  {item.q}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div style={{ padding: '40px 20px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
          {[
            { icon: '⚡', label: '3-7 Day Setup' },
            { icon: '🛡️', label: '30-Day Support' },
            { icon: '🔗', label: '50+ Integrations' },
            { icon: '🔒', label: 'Secure & Private' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ color: '#a1a1aa', fontSize: '14px' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div style={{ padding: '80px 20px 120px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }} id="contact">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            Get a Free Audit
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '32px' }}>
            Tell us what you want to automate. We&apos;ll show you how.
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
                placeholder="Work Email"
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
                placeholder="Company Name"
                required
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
                placeholder="What process do you want to automate?"
                rows={3}
                required
                value={formData.process}
                onChange={e => setFormData({...formData, process: e.target.value})}
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
            <div>
              <select
                required
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: e.target.value})}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#a1a1aa',
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">Select Monthly Budget</option>
                <option value="under-2k">Under $2K</option>
                <option value="2k-5k">$2K - $5K</option>
                <option value="5k-10k">$5K - $10K</option>
                <option value="10k+">$10K+</option>
              </select>
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
                transition: 'background 0.2s'
              }}
            >
              {status === 'loading' ? 'Sending...' : 'Get Free Audit →'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
