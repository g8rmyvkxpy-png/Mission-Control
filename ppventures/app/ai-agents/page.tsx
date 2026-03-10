'use client';

import Link from 'next/link';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const agents = [
  {
    id: 'neo',
    name: 'Neo',
    role: 'Lead Agent',
    avatar: '🦅',
    color: '#10b981',
    description: 'Primary autonomous agent that picks up tasks from the Command Centre, executes them using Minimax AI, finds leads for clients, generates outreach messages, answers questions using RAG from client documents, and logs all activity in real time.',
    tech: ['Minimax M2.5', 'Node.js', 'Supabase', 'Playwright RPA'],
    status: 'live'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Research Agent',
    avatar: '🗺️',
    color: '#8b5cf6',
    description: 'Deep research tasks, competitor analysis, industry news scraping, data analysis, and document summarisation.',
    tech: ['Minimax M2.5', 'Node.js', 'Supabase'],
    status: 'live'
  },
  {
    id: 'orbit',
    name: 'Orbit',
    role: 'Operations Agent',
    avatar: '🛸',
    color: '#06b6d4',
    description: 'Operational tasks, scheduling, monitoring, reporting, daily summaries, and system health checks.',
    tech: ['Minimax M2.5', 'Node.js', 'Supabase'],
    status: 'live'
  }
];

const capabilities = [
  { icon: '✅', title: 'Task Execution', desc: 'Agents pick up tasks autonomously and complete them without human input' },
  { icon: '🎯', title: 'Lead Generation', desc: 'Find and qualify leads based on your niche and target audience' },
  { icon: '✍️', title: 'Outreach Writing', desc: 'Write personalised outreach messages for every lead' },
  { icon: '📄', title: 'Document Q&A', desc: 'Answer questions based on your own private documents using RAG' },
  { icon: '🌐', title: 'Web Scraping', desc: 'Browse the web, extract data, monitor competitor sites using Playwright' },
  { icon: '📊', title: 'Daily Reports', desc: 'Generate and deliver daily performance summaries automatically' },
  { icon: '👁️', title: 'Competitor Monitoring', desc: 'Visit competitor sites daily and flag any changes' },
  { icon: '📰', title: 'Industry News', desc: 'Scrape and summarise relevant industry news every morning' },
  { icon: '⏰', title: 'Scheduled Tasks', desc: 'Run any workflow on a schedule via cron jobs' },
  { icon: '📡', title: 'Real-time Monitoring', desc: 'All agent activity visible live in the Command Centre' },
];

const comingSoon = [
  '📧 Email sending integration',
  '🔗 LinkedIn automation',
  '📅 Calendar and meeting booking',
  '🔌 CRM integration',
  '🤖 More specialised agents',
];

export default function AIAgentsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ minHeight: '50vh', paddingTop: '140px', paddingBottom: '60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', marginBottom: '16px' }}>
          Meet Your <span style={{ color: '#10b981' }}>AI Team</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Three real agents, running 24/7. Not placeholders — actual AI working for you right now.
        </p>
      </div>

      {/* Real Agents */}
      <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Our Live Agents</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {agents.map((agent) => (
            <div key={agent.id} style={{
              background: '#1a1a1d',
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${agent.color}40`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Status indicator */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                Live 24/7
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  fontSize: '48px',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${agent.color}20`,
                  borderRadius: '16px'
                }}>
                  {agent.avatar}
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{agent.name}</h3>
                  <p style={{ fontSize: '14px', color: agent.color, fontWeight: '500' }}>{agent.role}</p>
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '20px', lineHeight: 1.7 }}>
                {agent.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {agent.tech.map((t) => (
                  <span key={t} style={{
                    fontSize: '11px',
                    padding: '6px 10px',
                    background: '#27272a',
                    borderRadius: '6px',
                    color: '#a1a1aa'
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>What Our Agents Can Do</h2>
          <p style={{ color: '#6b7280', marginBottom: '40px', textAlign: 'center' }}>Real capabilities we've built — not hypotheticals</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {capabilities.map((cap, i) => (
              <div key={i} style={{
                background: '#1a1a1d',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #27272a',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <span style={{ fontSize: '24px' }}>{cap.icon}</span>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{cap.title}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#fbbf24' }}>🔜 In Development</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>Things we're actively building:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comingSoon.map((item, i) => (
              <div key={i} style={{
                background: '#1a1a1d',
                borderRadius: '8px',
                padding: '14px 20px',
                border: '1px solid #27272a',
                color: '#a1a1aa',
                fontSize: '14px',
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>1</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>You Sign Up</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Tell us your niche and target audience</p>
            </div>
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>2</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>We Deploy</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Neo, Atlas and Orbit configured for your business within minutes</p>
            </div>
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>3</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>They Get to Work</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Leads found, outreach written, reports delivered — while you sleep</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Deploy Your AI Team?
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
          Get Neo, Atlas and Orbit working for your business today
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/automation" style={{
            padding: '16px 32px',
            background: '#10b981',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: '700',
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            Start Free Trial
          </Link>
          <Link href="/services" style={{
            padding: '16px 32px',
            background: 'transparent',
            border: '2px solid #3f3f46',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
          }}>
            See How It Works
          </Link>
        </div>
      </section>

      <Footer />
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
