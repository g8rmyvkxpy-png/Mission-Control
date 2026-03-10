'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

const values = [
  {
    icon: '🚀',
    title: 'Move Fast',
    description: 'Ship today, iterate tomorrow. Speed is our competitive advantage. We build, test, and iterate in hours—not weeks.',
  },
  {
    icon: '🤖',
    title: 'Automate Everything',
    description: 'If a human does it twice, an AI should do it forever. Every repetitive task is an opportunity for autonomy.',
  },
  {
    icon: '💎',
    title: 'Ship Value',
    description: 'Features that don\'t deliver value are just busy work. We focus on what moves the needle.',
  },
  {
    icon: '🌐',
    title: 'Think Global',
    description: 'Building for the world from day one. Geography is no barrier to serving clients anywhere.',
  },
];

const timeline = [
  { year: '2024', milestone: 'PPVentures founded. Started exploring AI agent frameworks and autonomous systems.' },
  { year: 'Early 2025', milestone: 'First experiments with OpenClaw and autonomous agent workflows.' },
  { year: 'Mid 2025', milestone: 'Built first version of the Command Centre — a custom dashboard to manage AI agents.' },
  { year: 'Late 2025', milestone: 'Deployed Neo, Atlas and Orbit — 3 autonomous agents running 24/7 on our own infrastructure.' },
  { year: 'Early 2026', milestone: 'Launched AI Automation Suite for SMBs — helping solo consultants and small agencies automate their ops.' },
  { year: 'Now', milestone: 'Building in public. Expanding capabilities. Taking on clients.' },
];

const whatWeBuild = [
  {
    icon: '⚡',
    title: 'AI Automation Suite',
    desc: 'Our core product helping SMBs automate lead gen, outreach and ops.'
  },
  {
    icon: '🎯',
    title: 'Command Centre',
    desc: 'Our internal tool for managing autonomous agents (available to clients).'
  },
  {
    icon: '📄',
    title: 'RAG System',
    desc: 'Document intelligence so agents can answer questions from private data.'
  },
  {
    icon: '🕸️',
    title: 'RPA Engine',
    desc: 'Agents that browse the web, scrape data and automate browser tasks.'
  },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ minHeight: '50vh', paddingTop: '140px', paddingBottom: '60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', marginBottom: '16px' }}>
          About <span style={{ color: '#10b981' }}>PPVentures</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          We are a lean AI-first venture studio building autonomous systems that help businesses run smarter — starting with our own.
        </p>
      </div>

      {/* Mission */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Our Mission</h2>
        <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '40px', border: '1px solid #27272a' }}>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#e4e4e7', textAlign: 'center' }}>
            "To prove that a company can be built and run by AI agents — with humans as architects, not operators."
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#a1a1aa', textAlign: 'center', marginTop: '24px' }}>
            We believe the future of work isn't humans vs AI, but humans <em style={{ color: '#10b981' }}>with</em> AI.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '60px 20px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Our Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {values.map((value, index) => (
            <div 
              key={index} 
              style={{ 
                background: '#1a1a1d', 
                borderRadius: '16px', 
                padding: '28px', 
                border: '1px solid #27272a',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{value.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>{value.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Our Journey</h2>
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '24px', top: '0', bottom: '0', width: '2px', background: '#27272a' }} />
          
          {timeline.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '24px', padding: '16px 0', position: 'relative' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: index === timeline.length - 1 ? '#10b981' : '#27272a',
                border: '2px solid #10b981',
                flexShrink: 0,
                zIndex: 1,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>{item.year}</div>
                <div style={{ color: '#d4d4d8', fontSize: '15px', lineHeight: 1.5 }}>{item.milestone}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Are */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Who's Behind This</h2>
          <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
              D
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Deva</h3>
              <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Founder</p>
              <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                Product Manager by day, builder by night. Started PPVentures to prove that a small team with AI can compete with companies 10x our size. We build for ourselves first, then offer what works to clients.
              </p>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: '14px', textDecoration: 'none' }}>
                LinkedIn →
              </a>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '20px' }}>
            We are a small founding team building with AI as our force multiplier.
          </p>
        </div>
      </section>

      {/* What We Build */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>What We're Building</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
            We build for ourselves first, then offer what works to clients.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {whatWeBuild.map((item, index) => (
              <div key={index} style={{ background: '#1a1a1d', borderRadius: '12px', padding: '24px', border: '1px solid #27272a' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h4>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building in Public */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>We Build in Public</h2>
          <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
            We share what we build, what works and what doesn't. Follow along as we build PPVentures into a fully autonomous company.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
              LinkedIn
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
              X / Twitter
            </a>
            <Link href="/blog" style={{ padding: '10px 20px', background: '#1a1a1d', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
              Blog
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '24px' }}>
            Let's Build Something
          </h2>
          <p style={{ color: '#a1a1aa', marginBottom: '32px', fontSize: '16px' }}>
            Whether you want to automate your business or want to work together, we'd love to hear from you.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/automation" style={{ padding: '14px 28px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
              Start Free Trial
            </Link>
            <Link href="/contact" style={{ padding: '14px 28px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
