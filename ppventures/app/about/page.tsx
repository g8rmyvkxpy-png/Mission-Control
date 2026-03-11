import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'About | PPVentures',
  description: 'Built by founders who understand the pain of manual lead generation. Learn why we built PPVentures.',
};

const values = [
  {
    title: 'Show real outputs, not mockups',
    description: 'We screenshot everything. If our agents found 10 leads, we show you 10 real leads. No exaggerated claims.',
  },
  {
    title: 'Admit what does not work yet',
    description: 'Email sending is coming soon. LinkedIn automation is on the roadmap. We would not launch if we pretended otherwise.',
  },
  {
    title: 'Build what customers need',
    description: 'We talk to every user. Every feature ships because someone asked for it. Not because it sounds impressive.',
  },
  {
    title: 'One product, done well',
    description: 'Three agents, one price, $297/month. We are not trying to be everything to everyone.',
  },
];

const timeline = [
  { year: '2024', milestone: 'PPVentures founded. Started exploring AI agent frameworks.' },
  { year: 'Early 2025', milestone: 'First experiments with autonomous agent workflows.' },
  { year: 'Mid 2025', milestone: 'Built the Command Centre dashboard to manage agents.' },
  { year: 'Late 2025', milestone: 'Deployed Neo, Atlas and Orbit — 3 agents running 24/7.' },
  { year: 'Early 2026', milestone: 'Launched Automation Suite for solo consultants and agencies.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <section style={{ padding: '160px 20px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '700', marginBottom: '16px' }}>
          Built by founders. Powered by AI. Run transparently.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          We are the target customer. That is why this product exists.
        </p>
      </section>

      {/* The Story */}
      <section style={{ padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>The Story</h2>
          <div style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px' }}>
            <p style={{ marginBottom: '20px' }}>
              PPVentures started because I was the target customer. I was running a consulting business, spending half my week on lead gen, follow-ups, and admin instead of the work I was actually good at.
            </p>
            <p style={{ marginBottom: '20px' }}>
              I built Neo to find my own leads. Then Atlas to watch my competitors. Then Orbit to keep track of everything. When the agents started saving me 10+ hours a week, I realised other consultants and freelancers needed this too.
            </p>
            <p style={{ marginBottom: '20px' }}>
              PPVentures is now those same three agents — packaged, productised, and available for $297/month. The agents that run your business are the same ones that run mine.
            </p>
            <p>
              I am the founder and sole engineer behind PPVentures. No VC funding. No marketing team. Just a product I use every day, and a belief that every consultant deserves an AI team.
            </p>
          </div>
        </div>
      </section>

      {/* How We Build */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>How We Build</h2>
          <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px', marginBottom: '20px' }}>
            We build in public. Every week we share what we shipped, what broke, and what is coming next on our blog. We chose Minimax M2.5 because it gives the best results for our specific tasks at a sustainable cost. We use Supabase because it is fast, reliable, and open source. We use Playwright for web scraping because it handles real-world websites better than any other tool.
          </p>
          <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px' }}>
            We are a small team. We move fast. We ship honest products.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>The Journey</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', paddingBottom: i < timeline.length - 1 ? '24px' : 0, borderLeft: i < timeline.length - 1 ? '2px solid #27272a' : 'none', paddingLeft: '24px', marginLeft: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0, marginLeft: '-31px' }}></div>
                <div>
                  <p style={{ color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>{item.year}</p>
                  <p style={{ color: '#a1a1aa' }}>{item.milestone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Our Values</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {values.map((value, i) => (
              <div key={i} style={{ background: '#1a1a1d', borderRadius: '12px', padding: '24px', border: '1px solid #27272a' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>{value.title}</h3>
                <p style={{ color: '#a1a1aa', margin: 0 }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Ready to try it?</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
            Start Free Trial
          </Link>
          <Link href="/blog" style={{ padding: '16px 32px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            Read Our Build Log
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
