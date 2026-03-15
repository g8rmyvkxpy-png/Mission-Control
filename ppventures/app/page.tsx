'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const benefits = [
  { icon: '⏰', title: 'Save 10+ Hours/Week', desc: 'Automate repetitive tasks that drain your time' },
  { icon: '💰', title: 'Cut Operational Costs', desc: 'More output without hiring more people' },
  { icon: '🚀', title: 'Scale Faster', desc: 'Automations work 24/7 while you sleep' },
  { icon: '🧠', title: 'Focus on High-Value Work', desc: 'Let AI handle the grunt work' },
];

const services = [
  { icon: '📧', title: 'Email', desc: 'Auto-replies, follow-ups, summarization' },
  { icon: '📊', title: 'Reports', desc: 'Auto-generated from your data' },
  { icon: '🔗', title: 'Integrations', desc: 'Connect CRM, Slack, Sheets' },
  { icon: '📅', title: 'Meetings', desc: 'Scheduling & summaries' },
];

const socialProof = [
  { metric: '24/7', label: 'Automation Running' },
  { metric: '1000+', label: 'Tasks Automated' },
  { metric: '50+', label: 'Integrations' },
  { metric: '<24h', label: 'Avg. Setup Time' },
];

export default function Home() {
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
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>🚀 AI Automation for Businesses</span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(36px, 6vw, 64px)', 
          fontWeight: '800', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Automate Your Business<br/>with AI
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: 'clamp(16px, 2vw, 20px)', 
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          We build custom AI automations that save you hours every week. 
          From email management to data workflows.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/ai-ops#contact" style={{
            padding: '16px 32px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            Get Started →
          </Link>
          <a href="/ai-ops#how-it-works" style={{
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

      {/* Social Proof */}
      <div style={{ padding: '40px 20px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '32px' }}>
          {socialProof.map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{item.metric}</div>
              <div style={{ fontSize: '14px', color: '#71717a' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#fff' }}>
            Why Automate?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {benefits.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Who We Work With */}
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center', color: '#fff' }}>
            Who We Work With
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { icon: '💼', title: 'Consultants', desc: 'Automate client follow-ups, scheduling, and reporting' },
              { icon: '🏢', title: 'Agencies', desc: 'Streamline project workflows and team communications' },
              { icon: '🩺', title: 'Healthcare', desc: 'Patient communications and appointment scheduling' },
              { icon: '🏠', title: 'Real Estate', desc: 'Lead capture and property management automation' },
              { icon: '🛒', title: 'E-commerce', desc: 'Order processing and customer support automation' },
              { icon: '📚', title: 'Professional Services', desc: 'Billing, documentation, and client management' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '13px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: 'center', color: '#fff' }}>
            What We Automate
          </h2>
          <p style={{ color: '#71717a', textAlign: 'center', marginBottom: '48px' }}>
            From simple tasks to complex workflows
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {services.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '13px', marginTop: '4px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/ai-ops" style={{ color: '#10b981', textDecoration: 'underline', fontSize: '16px' }}>
              View all services & pricing →
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works - Brief */}
      <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }} id="how-it-works">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center', color: '#fff' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { step: '1', title: 'Tell us what to automate', desc: 'Share the tasks that eat your time' },
              { step: '2', title: 'We build it in 3-7 days', desc: 'Custom n8n automation' },
              { step: '3', title: 'You save hours every week', desc: 'Wake up to completed work' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 20px 120px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Save Time?
        </h2>
        <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>
          Get a free audit. See what we can automate for you.
        </p>
        <Link href="/ai-ops#contact" style={{
          display: 'inline-block',
          padding: '16px 32px',
          background: '#10b981',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '16px',
          textDecoration: 'none',
        }}>
          Get Free Audit →
        </Link>
      </div>

      <Footer />
    </div>
  );
}
