import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'About | PPVentures',
  description: 'Learn how PPVentures helps businesses automate with AI. We build custom automations that save you hours every week.',
};

const values = [
  {
    icon: '🎯',
    title: 'Outcome-First',
    description: 'We measure success by hours saved, not features built. Every automation delivers tangible time savings.',
  },
  {
    icon: '🔧',
    title: 'Build What Works',
    description: 'We use n8n, OpenAI, and proven tools. No overengineering — just reliable automation that actually runs.',
  },
  {
    icon: '📋',
    title: 'Transparent Pricing',
    description: 'No hidden fees. No surprise charges. What you see is what you pay.',
  },
  {
    icon: '🤝',
    title: 'Long-Term Partnership',
    description: 'Retainers include ongoing maintenance. We succeed when your automation keeps working.',
  },
];

const capabilities = [
  { icon: '⏱️', title: 'Save 10+ Hours/Week', desc: 'Automate repetitive tasks that drain your time' },
  { icon: '🔗', title: 'Connect Any Tool', desc: 'CRM, email, Slack, spreadsheets — we integrate them all' },
  { icon: '🧠', title: 'AI-Powered', desc: 'Not just rules — intelligent workflows that learn' },
  { icon: '🚀', title: 'Deploy in Days', desc: 'From conversation to working automation in 3-7 days' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <section style={{ padding: '160px 20px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '700', marginBottom: '16px' }}>
          We Automate Your Business<br/>So You Can Focus on Growth
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Custom AI automations built for businesses that want to scale without hiring more people.
        </p>
      </section>

      {/* Why We Exist */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Why We Exist</h2>
          <div style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px' }}>
            <p style={{ marginBottom: '20px' }}>
              Every business owner faces the same problem: repetitive tasks that eat up hours but don't move the needle. Data entry. Follow-up emails. Report generation. Meeting scheduling.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Hiring for these tasks is expensive. Doing them yourself is a waste of your most valuable resource — time.
            </p>
            <p style={{ marginBottom: '20px' }}>
              We built PPVentures to solve this. We create custom AI automations that handle the grunt work so you can focus on what actually grows your business.
            </p>
            <p>
              Whether you're a solo consultant or a growing agency, we build automations that fit your workflow — not the other way around.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>What We Do</h2>
          <p style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '48px' }}>
            We build custom automations that fit your business
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {capabilities.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
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
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>How We Work</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { step: '01', title: 'Discovery Call', desc: 'We learn about your business, identify time-draining tasks, and understand your goals.' },
              { step: '02', title: 'Custom Build', desc: 'We build a tailored automation using n8n and AI. Most builds take 3-7 days.' },
              { step: '03', title: 'Hand-off & Support', desc: 'You get a working automation with 30-day support. Retainers include ongoing maintenance.' },
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
      </section>

      {/* Values */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>How We Work</h2>
          <p style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '48px' }}>
            Our principles guide every automation we build
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {values.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Automate?
        </h2>
        <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>
          Get a free audit. Tell us what you want to automate.
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
      </section>

      <Footer />
    </div>
  );
}
