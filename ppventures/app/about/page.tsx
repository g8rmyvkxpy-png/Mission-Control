'use client';

import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

const values = [
  {
    icon: '🚀',
    title: 'Move Fast',
    description: 'Ship today, iterate tomorrow. Speed is our competitive advantage.',
  },
  {
    icon: '🤖',
    title: 'Automate Everything',
    description: 'If a human does it twice, an AI should do it forever.',
  },
  {
    icon: '💎',
    title: 'Ship Value',
    description: 'Features that don\'t deliver value are just busy work.',
  },
  {
    icon: '🌐',
    title: 'Think Global',
    description: 'Building for the world from day one. Geography is no barrier.',
  },
];

const journey = [
  { year: '2024', milestone: 'First AI agent deployed' },
  { year: '2024', milestone: 'Mission Control launched' },
  { year: '2025', milestone: '21 AI agents running' },
  { year: '2025', milestone: 'First enterprise client' },
  { year: '2026', milestone: 'Building in public...' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div className="hero" style={{ minHeight: '50vh', paddingTop: '120px', position: 'relative', zIndex: 1 }}>
        <h1>
          About <span style={{ color: '#f97316' }}>PPVentures</span>
        </h1>
        <p style={{ color: '#a1a1aa', maxWidth: '600px' }}>
          We're building the autonomous companies of tomorrow. 
          AI-powered, globally distributed, running 24/7.
        </p>
      </div>

      {/* Mission */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
        <h2 className="section-title">Our Mission</h2>
        <div style={{ 
          background: '#1a1a1d', 
          borderRadius: '16px', 
          padding: '48px', 
          border: '1px solid #27272a',
          marginTop: '32px'
        }}>
          <p style={{ fontSize: '20px', lineHeight: '1.8', color: '#e4e4e7' }}>
            To prove that a company can be built and run by AI agents — with humans as architects, not operators.
            <br /><br />
            We believe the future of work isn't humans vs AI, but humans <em>with</em> AI. 
            Our goal: build systems that create value while we sleep.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">Our Values</h2>
        <div className="grid" style={{ maxWidth: '1200px', margin: '48px auto 0' }}>
          {values.map((value, index) => (
            <div key={index} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{value.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
              <p style={{ color: '#a1a1aa' }}>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <h2 className="section-title">Our Journey</h2>
        <div style={{ maxWidth: '800px', margin: '48px auto 0' }}>
          {journey.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px',
              padding: '20px 0',
              borderBottom: index < journey.length - 1 ? '1px solid #27272a' : 'none'
            }}>
              <div style={{ 
                minWidth: '80px', 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#f97316' 
              }}>
                {item.year}
              </div>
              <div style={{ color: '#e4e4e7', fontSize: '16px' }}>
                {item.milestone}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', background: '#1a1a1d', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>Join the Future</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>
            Whether you want to build an AI-powered company or just automate your current business, let's talk.
          </p>
          <a href="/contact" className="btn btn-primary">Get in Touch</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
