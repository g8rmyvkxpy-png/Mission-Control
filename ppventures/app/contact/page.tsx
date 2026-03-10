'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export default function ContactPage({ searchParams }: { searchParams: { agent?: string } }) {
  const agentName = searchParams.agent || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    budget: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const services = [
    { value: 'ai-automation', label: 'AI Automation Suite ($297/month)' },
    { value: 'ai-agents', label: 'AI Agent Development (custom)' },
    { value: 'consulting', label: 'Technical Consulting' },
    { value: 'general', label: 'General Enquiry' },
  ];

  const budgets = [
    { value: '', label: 'Select budget (optional)' },
    { value: 'under-500', label: 'Under $500/month' },
    { value: '500-1000', label: '$500 - $1,000/month' },
    { value: '1000-plus', label: '$1,000+/month' },
    { value: 'one-time', label: 'One-time project' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', service: '', budget: '', message: '' });
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
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Thanks {formData.name}!</h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
            We'll get back to you within 24 hours.
          </p>
          <Link href="/" style={{ color: '#10b981', textDecoration: 'none' }}>← Back to Home</Link>
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
      <div style={{ padding: '140px 20px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', marginBottom: '12px' }}>
          Get in <span style={{ color: '#10b981' }}>Touch</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(14px, 2vw, 18px)', maxWidth: '500px', margin: '0 auto' }}>
          Have questions? Let's talk about how AI can transform your business.
        </p>
      </div>

      {/* Trial Banner */}
      <div style={{ padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'linear-gradient(135deg, #10b98120, #05966910)', border: '1px solid #10b98140', borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
          <span style={{ color: '#a1a1aa' }}>Looking to start your free trial? </span>
          <Link href="/automation" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>Sign up directly here →</Link>
        </div>
      </div>

      {/* Main Content */}
      <section style={{ padding: '40px 20px 80px', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
          
          {/* Left Column - Contact Info */}
          <div>
            {/* Graphic */}
            <div style={{ 
              width: '100%', 
              height: '180px', 
              background: 'linear-gradient(135deg, #10b98120, #05966910)', 
              borderRadius: '16px', 
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
            }}>
              🤖
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Contact Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📧</span>
                <a href="mailto:hello@ppventures.tech" style={{ color: '#a1a1aa', textDecoration: 'none' }}>hello@ppventures.tech</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <span style={{ color: '#a1a1aa' }}>Bengaluru, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⏱️</span>
                <span style={{ color: '#a1a1aa' }}>We typically respond within 24 hours</span>
              </div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', fontSize: '14px', textDecoration: 'none' }}>
                LinkedIn
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', fontSize: '14px', textDecoration: 'none' }}>
                Twitter / X
              </a>
            </div>

            {/* What Happens Next */}
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '40px', marginBottom: '16px' }}>What Happens Next</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>You send a message — fill in the form, tell us about your business</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>We review and reply — within 24 hours, we'll send a personalised response</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>We scope your project — a short call to understand your needs and propose a plan</p>
              </div>
            </div>

            {/* FAQs */}
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: '40px', marginBottom: '16px' }}>Quick Questions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>How quickly do you respond?</p>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Within 24 hours on weekdays. Usually faster.</p>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Is there a minimum contract?</p>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>No. Month-to-month on all plans. Cancel anytime.</p>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Can I start with a free trial?</p>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Yes — the AI Automation Suite includes a 14-day free trial. No credit card needed.</p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Send us a Message</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Fill in the details below and we'll get back to you.</p>
            
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: errors.name ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: errors.email ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              {/* Company */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Company <span style={{ color: '#6b7280' }}>(optional)</span>
                </label>
                <input 
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Service */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Service Interested In <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: errors.service ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: formData.service ? '#fff' : '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  <option value="">Select a service</option>
                  {services.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.service && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.service}</p>}
              </div>

              {/* Budget */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Budget Range <span style={{ color: '#6b7280' }}>(optional)</span>
                </label>
                <select 
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: formData.budget ? '#fff' : '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  {budgets.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#fff' }}>
                  Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={agentName ? `I'm interested in deploying ${agentName} for my business...` : "Tell us about your project, goals, and how we can help..."}
                  rows={5}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: '#0a0a0b', 
                    border: errors.message ? '1px solid #ef4444' : '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '120px',
                  }}
                />
                {errors.message && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.message}</p>}
              </div>

              {/* Error message */}
              {status === 'error' && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Submit */}
              <button 
                type="submit" 
                disabled={status === 'loading'}
                style={{ 
                  width: '100%', 
                  padding: '14px 24px', 
                  background: status === 'loading' ? '#059669' : '#10b981', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '16px',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
