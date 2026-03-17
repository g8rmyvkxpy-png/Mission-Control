'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const helpOptions = [
  { value: 'product-question', label: 'I have a question about the product' },
  { value: 'account-help', label: 'I need help with my account' },
  { value: 'feature-suggestion', label: 'I want to suggest a feature' },
  { value: 'partnership', label: "I'm interested in a partnership" },
  { value: 'other', label: 'Something else' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    helpType: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.helpType || !formData.message) return;

    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          service: formData.helpType,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', helpType: '', message: '' });
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
          Let&apos;s talk.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: '#a1a1aa', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Question about the product? Need help getting started? Want to suggest a feature? We respond within 24 hours.
        </p>
      </section>

      {/* Form */}
      <section style={{ padding: '40px 20px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {status === 'success' ? (
            <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#10b981', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Got it!</p>
              <p style={{ color: '#a1a1aa' }}>We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="Your name" 
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} 
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Email *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                  placeholder="you@example.com" 
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }} 
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>What can we help with? *</label>
                <select 
                  value={formData.helpType} 
                  onChange={(e) => setFormData({...formData, helpType: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px' }}
                >
                  <option value="">Select an option</option>
                  {helpOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>Message *</label>
                <textarea 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  required 
                  placeholder="Tell us more..." 
                  minLength={10}
                  rows={5}
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '16px', resize: 'vertical' }} 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'loading'}
                style={{ width: '100%', padding: '16px 24px', background: '#10b981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message →'}
              </button>
              
              {status === 'error' && (
                <p style={{ color: '#ef4444', marginTop: '12px', textAlign: 'center' }}>Something went wrong. Please try again or email us at hello@ppventures.tech</p>
              )}
            </form>
          )}
          
          <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280', fontSize: '14px' }}>
            Or email us directly: <a href="mailto:hello@ppventures.tech" style={{ color: '#10b981' }}>hello@ppventures.tech</a>
          </p>
          
          {/* WhatsApp Option */}
          <div style={{ textAlign: 'center', marginTop: '24px', padding: '20px', background: '#1a1a1d', borderRadius: '12px' }}>
            <p style={{ color: '#a1a1aa', marginBottom: '12px' }}>Prefer instant responses?</p>
            <a href="https://wa.me/919999999999" target="_blank" rel="noopener" style={{ display: 'inline-block', padding: '14px 28px', background: '#25D366', borderRadius: '8px', color: '#fff', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
              💬 Chat on WhatsApp
            </a>
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>Typically replies within minutes</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
