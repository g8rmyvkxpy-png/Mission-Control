'use client';

import Link from 'next/link';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const services = [
  {
    icon: '🤖',
    title: 'AI Agent Development & Integration',
    description: 'We build and deploy custom AI agents for your business — wired into your workflows, running autonomously 24/7',
    features: [
      '✓ Custom AI agent development (Minimax, OpenAI)',
      '✓ Lead generation agent — finds and qualifies leads daily',
      '✓ Outreach agent — writes personalised messages per lead',
      '✓ Research agent — competitor monitoring, industry news',
      '✓ Web scraping & RPA — agents browse and extract data',
      '✓ Document Q&A — agents answer from your private docs',
      '✓ Task automation — agents run recurring tasks on schedule',
      '✓ Integration with your existing tools via API',
    ],
    price: 'Contact for pricing',
  },
  {
    icon: '💡',
    title: 'AI Strategy & Technical Consulting',
    description: 'Expert guidance on how to implement AI in your business — from strategy to execution',
    features: [
      '✓ AI Strategy Sessions — 1:1 sessions to map your AI roadmap',
      '✓ Architecture Review — review stack, recommend integrations',
      '✓ Tech Stack Selection — choose right AI tools and models',
      '✓ MVP Development — build working AI prototype fast',
      '✓ Go-to-Market Planning — launch AI-powered products',
    ],
    price: '₹2,49,000',
  },
  {
    icon: '🎯',
    title: 'AI Command Centre',
    description: 'A custom-built dashboard that gives you full visibility and control over your AI agents — see everything they are doing in real time',
    features: [
      '✓ 3 autonomous AI agents (Neo, Atlas, Orbit) working 24/7',
      '✓ Live task board — see every task agents are working on',
      '✓ Real-time activity feed — watch agents work live',
      '✓ Cron job scheduler — schedule any task automatically',
      '✓ Projects tracker — track progress on all projects',
      '✓ Memory screen — searchable record of all agent chats',
      '✓ Docs screen — all documents agents create, searchable',
      '✓ Knowledge base — upload docs, agents answer from them',
      '✓ Client management — manage leads and pipeline',
      '✓ Daily performance reports',
    ],
    price: '₹16,500/mo',
    popular: true,
  },
  {
    icon: '⚡',
    title: 'AI Automation Suite for SMBs',
    description: 'A complete done-for-you AI automation service. We deploy agents that find leads, write outreach, monitor competitors and send daily reports — all automatically',
    features: [
      '✓ 10–25 qualified leads found daily',
      '✓ Personalised outreach messages written per lead',
      '✓ Daily competitor monitoring',
      '✓ Industry news digest every morning',
      '✓ Weekly website audit',
      '✓ Daily performance report',
      '✓ Client dashboard to track everything',
      '✓ RAG-powered Q&A from your documents',
    ],
    price: '$297/mo (₹24,750)',
    badge: 'MOST POPULAR',
  },
];

const comparisonHeaders = ['Feature', 'AI Agents & Integration', 'Consulting', 'Command Centre', 'Automation Suite'];

const comparisonRows = [
  ['Custom AI Agents', '✓', '—', '3 included', '3 included'],
  ['Lead Generation', '✓', '—', '—', '✓ Daily'],
  ['Dashboard Access', '—', '—', '✓', '✓'],
  ['Task Scheduling', '✓', '—', '✓', '✓'],
  ['Document Q&A', '✓', '—', '✓', '✓'],
  ['Daily Reports', '—', '—', '✓', '✓'],
  ['Strategy Sessions', '—', '✓', '—', '—'],
  ['Price', 'Contact us', '₹2,49,000', '₹16,500/mo', '₹24,750/mo'],
];

const faqs = [
  { q: 'How long does setup take?', a: 'Most clients are up and running within 5 minutes. The AI agents start finding leads and working immediately after deployment.' },
  { q: 'What AI models do you use?', a: 'We primarily use Minimax M2.5 for its excellent performance-to-cost ratio. We can also integrate OpenAI or other models based on your needs.' },
  { q: 'Can I see what agents are doing?', a: 'Yes! The Command Centre provides real-time visibility into all agent activity. You can see tasks in progress, completed work, and monitor performance.' },
  { q: 'What happens after the free trial?', a: 'After your 14-day trial, you can choose a plan that fits your needs. Cancel anytime — no long-term contracts.' },
  { q: 'Do I need technical knowledge?', a: 'No. Our agents handle all the technical work. You just define your niche and target audience, and the agents do the rest.' },
];

const comingSoon = [
  '🔜 Email sending integration',
  '🔜 LinkedIn outreach automation',
  '🔜 Calendar and meeting booking',
  '🔜 CRM integration (HubSpot, Salesforce)',
  '🔜 WhatsApp agent',
];

export default function ServicesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ minHeight: '50vh', paddingTop: '140px', paddingBottom: '60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', marginBottom: '16px' }}>
          Services & <span style={{ color: '#10b981' }}>Products</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(16px, 2vw, 18px)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          From AI agents to complete automation — build your autonomous company with honest, proven solutions.
        </p>
      </div>

      {/* Services Grid */}
      <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {services.map((service, index) => (
            <div key={index} style={{ 
              background: '#1a1a1d',
              borderRadius: '16px',
              padding: '32px',
              border: service.popular ? '2px solid #10b981' : '1px solid #27272a',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {service.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#10b981',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  {service.badge}
                </div>
              )}
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
                {service.title}
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                {service.description}
              </p>
              
              <ul style={{ listStyle: 'none', marginBottom: '24px', flex: 1 }}>
                {service.features.map((feature, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px',
                    marginBottom: '10px',
                    color: '#a1a1aa',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #27272a',
              }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                  {service.price}
                </span>
                <Link href="/contact" style={{
                  padding: '10px 20px',
                  background: service.popular ? '#10b981' : 'transparent',
                  border: service.popular ? 'none' : '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Compare Plans</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  {comparisonHeaders.map((h, i) => (
                    <th key={i} style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #27272a', color: i === 0 ? '#a1a1aa' : '#fff', fontWeight: '600' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '14px 16px', borderBottom: '1px solid #27272a', color: j === 0 ? '#a1a1aa' : '#fff' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#fbbf24' }}>In Development — coming soon</h2>
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

      {/* FAQ */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
                <summary style={{ padding: '20px', cursor: 'pointer', fontWeight: '600', color: '#fff', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ color: '#10b981' }}>▼</span>
                </summary>
                <div style={{ padding: '0 20px 20px', color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px' }}>
          Book a free consultation call.
        </p>
        <Link href="/contact" style={{
          padding: '16px 32px',
          background: '#10b981',
          borderRadius: '10px',
          color: '#fff',
          fontWeight: '700',
          fontSize: '16px',
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Book Consultation
        </Link>
        <p style={{ marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
          📅 Calendly link placeholder — add your Calendly URL here
        </p>
      </section>

      <Footer />
    </div>
  );
}
