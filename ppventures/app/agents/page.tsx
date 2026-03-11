import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Meet Neo, Atlas & Orbit | PPVentures',
  description: 'Three AI agents built to run your business operations. Learn what each agent does and what they cant do yet.',
};

const agents = [
  {
    name: 'Neo',
    role: 'Lead Agent',
    icon: '🦅',
    whatDoes: [
      'Searches the web daily for businesses matching your ideal client profile',
      'Qualifies each lead based on criteria you define',
      'Drafts personalised outreach messages for every lead',
      'Logs all activity with full audit trail in your dashboard',
    ],
    howWorks: "Neo uses Minimax M2.5 for AI reasoning, Playwright for web browsing and data extraction, and Supabase for data storage. Every morning at 7 AM, Neo runs your configured lead search, visits relevant websites, extracts contact and business information, scores each lead against your criteria, and writes a custom outreach message based on the prospect's business.",
    delivers: [
      '10 qualified leads per day (minimum)',
      'Outreach message draft for each lead',
      'Lead quality score and reasoning',
      'Source URL for each lead',
    ],
    cantDo: [
      'Send emails directly (coming soon)',
      'Integrate with your CRM (coming soon)',
      'Make phone calls (not planned)',
    ],
    tech: 'Minimax M2.5 · Node.js · Playwright RPA · Supabase',
  },
  {
    name: 'Atlas',
    role: 'Research Agent',
    icon: '🗺️',
    whatDoes: [
      'Monitors your top competitors websites daily',
      'Scrapes and summarises industry news every morning',
      'Handles deep research tasks on demand',
      'Summarises documents you upload',
    ],
    howWorks: "Atlas visits your competitors sites daily and compares them against previous snapshots. Any pricing change, new feature, new blog post, or structural change gets flagged immediately. It also crawls industry news sources relevant to your niche and produces a morning digest.",
    delivers: [
      'Competitor change alerts (same day)',
      'Morning industry news digest',
      'On-demand research reports',
      'Document summaries (via RAG)',
    ],
    cantDo: [
      'Social media monitoring (coming soon)',
      'Automated report scheduling to email (coming soon)',
    ],
    tech: 'Minimax M2.5 · Node.js · Supabase',
  },
  {
    name: 'Orbit',
    role: 'Operations Agent',
    icon: '🛸',
    whatDoes: [
      'Generates end-of-day performance reports',
      'Tracks all task completions across Neo and Atlas',
      'Monitors system health and agent uptime',
      'Runs scheduled workflows via cron jobs',
    ],
    howWorks: "Orbit is the operational backbone. It watches Neo and Atlas, tracks what they have done, measures performance, and compiles everything into a daily summary. If something breaks or an agent fails a task, Orbit flags it.",
    delivers: [
      'Evening performance summary',
      'Task completion log',
      'Agent health status',
      'Weekly trend reports',
    ],
    cantDo: [
      'Calendar integration (coming soon)',
      'Meeting scheduling (coming soon)',
      'Slack/Teams notifications (coming soon)',
    ],
    tech: 'Minimax M2.5 · Node.js · Supabase',
  },
];

export default function AgentsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <section style={{ padding: '160px 20px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '700', marginBottom: '16px' }}>
          Meet Neo, Atlas & Orbit
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Three AI agents built to run your business operations. Here's exactly what each one does — and what they can't do yet.
        </p>
      </section>

      {/* Agent Deep Dives */}
      <section style={{ padding: '40px 20px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
          {agents.map((agent, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '24px', padding: '40px', border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ fontSize: '56px' }}>{agent.icon}</div>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{agent.name}: {agent.role}</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#10b981', fontSize: '14px' }}>● Live 24/7</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>What {agent.name} does:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', lineHeight: 1.8 }}>
                  {agent.whatDoes.map((item, j) => (
                    <li key={j} style={{ marginBottom: '8px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>How {agent.name} works:</h3>
                <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>{agent.howWorks}</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>What {agent.name} delivers:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', lineHeight: 1.8 }}>
                  {agent.delivers.map((item, j) => (
                    <li key={j} style={{ marginBottom: '8px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '32px', padding: '20px', background: '#27272a40', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>What {agent.name} can't do yet:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', lineHeight: 1.8 }}>
                  {agent.cantDo.map((item, j) => (
                    <li key={j} style={{ marginBottom: '8px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              <p style={{ color: '#6b7280', fontSize: '14px' }}>Tech stack: {agent.tech}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Minimax */}
      <section style={{ padding: '80px 20px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Why we chose Minimax M2.5</h2>
          <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px' }}>
            We tested multiple models — GPT-4, Claude, Llama, and Minimax — specifically on the tasks our agents perform: lead qualification, outreach writing, competitor analysis, and document summarisation. Minimax M2.5 gave us the best balance of quality, speed, and cost for these specific use cases. Our agents make hundreds of AI calls per day per client — model economics matter at that scale.
          </p>
          <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '16px', marginTop: '16px' }}>
            We're model-agnostic by design. If a better option emerges for a specific task, we switch. You always get the best results regardless of what's under the hood.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '24px' }}>Ready to put them to work?</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/pricing" style={{ padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
            Start Free Trial
          </Link>
          <a href="/#sample-report" style={{ padding: '16px 32px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            Get a Free Sample Report
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
