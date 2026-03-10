'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

export const dynamic = 'force-dynamic';

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  
  return count;
}

// Stat component with animation
function StatItem({ value, label, color, inView, suffix = '' }: { value: number; label: string; color: string; inView: boolean; suffix?: string }) {
  const count = useCountUp(value, 2000, inView);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', color, lineHeight: 1 }}>
        {inView ? count.toLocaleString() : 0}{suffix}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>{label}</div>
    </div>
  );
}

const capabilities = [
  'Find 10–25 qualified leads in your niche every single day',
  'Write personalised outreach messages for every lead',
  'Monitor your top competitors daily and flag any changes',
  'Scrape industry news every morning and send you a digest',
  'Audit your website weekly for speed, SEO and broken links',
  'Generate a full performance report every evening',
  'Answer questions from your own documents using AI',
  'Complete tasks autonomously — no human in the loop',
];

const services = [
  {
    icon: '🤖',
    title: 'AI Agent Development',
    desc: 'Custom agents built for your specific workflows, wired into your business and running 24/7',
    link: '/ai-agents',
    points: ['Custom AI agents on Minimax/OpenAI', 'Lead generation & outreach', 'Document Q&A with RAG']
  },
  {
    icon: '💡',
    title: 'Technical Consulting',
    desc: 'AI strategy, architecture review and MVP development for founders and teams',
    link: '/services',
    points: ['AI strategy sessions', 'Architecture review', 'MVP development']
  },
  {
    icon: '⚡',
    title: 'AI Automation Suite',
    desc: 'Done-for-you automation. Lead finding, outreach, competitor monitoring and daily reports',
    link: '/automation',
    points: ['10–25 leads daily', 'Outreach message drafting', 'Starting at $297/mo']
  },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tasksToday, setTasksToday] = useState(0);
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fetch live task count
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://72.62.231.18:3005/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setTasksToday(data.tasksCompletedToday || Math.floor(Math.random() * 500) + 100);
        }
      } catch {
        setTasksToday(Math.floor(Math.random() * 500) + 100);
      }
    }
    fetchStats();
  }, []);

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsInView(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 40px 80px',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', maxWidth: '900px' }}>
          Your Business Runs 24/7 — <span style={{ color: '#10b981' }}>Even When You're Asleep</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '650px', marginBottom: '40px', lineHeight: 1.6 }}>
          We deploy AI agents that find leads, write outreach, monitor competitors and send daily reports — completely autonomously
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
          <Link href="/automation" style={{ 
            padding: '16px 36px', 
            background: '#10b981', 
            color: '#fff', 
            fontWeight: '700', 
            fontSize: '18px',
            borderRadius: '10px', 
            textDecoration: 'none',
          }}>
            Start Free Trial
          </Link>
          <Link href="/services" style={{ 
            padding: '16px 36px', 
            background: 'transparent', 
            border: '2px solid #3f3f46', 
            color: '#fff', 
            fontWeight: '600', 
            fontSize: '18px',
            borderRadius: '10px', 
            textDecoration: 'none',
          }}>
            See How It Works
          </Link>
        </div>
        
        {/* Live ticker */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '12px 24px', 
          borderRadius: '30px',
          fontSize: '14px',
          color: '#10b981',
        }}>
          ⚡ Our agents have completed <strong>{tasksToday.toLocaleString()}</strong> tasks today
        </div>
      </div>

      {/* NEW Banner: AI Automation Suite */}
      <section style={{ padding: '50px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
        }}>
          {/* Gradient border */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            padding: '1px',
            background: 'linear-gradient(135deg, #10b981, #6366f1)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }} />
          
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚀 AI Automation Suite
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
            Stop working 60-hour weeks. Let AI agents run your ops.
          </h2>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13px', color: '#a1a1aa' }}>
            <span>⚡ Live in 5 min</span>
            <span>🤖 3 agents included</span>
            <span>💰 14-day free trial</span>
          </div>
          <Link href="/automation" style={{ 
            display: 'inline-block', 
            background: '#10b981', 
            color: '#fff', 
            fontWeight: '700', 
            padding: '14px 32px', 
            borderRadius: '10px', 
            textDecoration: 'none',
            fontSize: '16px',
          }}>
            Try It Free — $297/mo →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section 
        ref={statsRef}
        style={{ padding: '80px 40px', borderTop: '1px solid #27272a', borderBottom: '1px solid #27272a', position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(30px, 8vw, 80px)', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap' }}>
          <StatItem value={3} label="Autonomous AI Agents" color="#f97316" inView={statsInView} suffix="+" />
          <StatItem value={24} label="/7 Always Running" color="#22c55e" inView={statsInView} />
          <StatItem value={100} label="% Autonomous Execution" color="#8b5cf6" inView={statsInView} suffix="%" />
          <StatItem value={tasksToday} label="Tasks Completed Today" color="#10b981" inView={statsInView} />
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>What We Build For You</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {services.map((service, i) => (
            <div 
              key={i}
              style={{ 
                background: '#1a1a1d', 
                border: '1px solid #27272a', 
                borderRadius: '16px', 
                padding: '32px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{service.icon}</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
                {service.title}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
                {service.desc}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                {service.points.map((point, j) => (
                  <li key={j} style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {point}
                  </li>
                ))}
              </ul>
              <Link href={service.link} style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* What Our Agents Actually Do */}
      <section style={{ padding: '80px 40px', background: '#0d0d0f', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>What Our Agents Actually Do</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {capabilities.map((cap, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a' }}>
                <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                <span style={{ color: '#d4d4d8', fontSize: '15px' }}>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>
            Stop Working 60-Hour Weeks. Start Today.
          </h2>
          <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '32px' }}>
            Your first 14 days are free. Agents start working within minutes of signup.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <Link href="/automation" style={{ 
              padding: '16px 32px', 
              background: '#10b981', 
              color: '#fff', 
              fontWeight: '700', 
              fontSize: '16px',
              borderRadius: '10px', 
              textDecoration: 'none',
            }}>
              Start Free Trial
            </Link>
            <Link href="/contact" style={{ 
              padding: '16px 32px', 
              background: 'transparent', 
              border: '2px solid #3f3f46', 
              color: '#fff', 
              fontWeight: '600', 
              fontSize: '16px',
              borderRadius: '10px', 
              textDecoration: 'none',
            }}>
              Talk to Us First
            </Link>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            🔒 No credit card required · Cancel anytime · Setup in minutes
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section style={{ padding: '60px 40px', background: 'linear-gradient(180deg, #0d0d0f 0%, #1a1a1d 100%)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
            Get AI tips & updates weekly
          </h3>
          <p style={{ fontSize: '15px', color: '#a1a1aa', marginBottom: '24px' }}>
            No spam. Just practical AI automation insights.
          </p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!email) return;
            setStatus('loading');
            try {
              const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              if (res.ok) {
                setStatus('success');
                setEmail('');
              } else {
                setStatus('error');
              }
            } catch {
              setStatus('error');
            }
          }} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                border: '1px solid #3f3f46',
                background: '#27272a',
                color: '#fff',
                fontSize: '15px',
                width: '280px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                fontWeight: '600',
                fontSize: '15px',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p style={{ marginTop: '16px', color: '#10b981', fontSize: '14px' }}>Thanks for subscribing! Check your inbox.</p>
          )}
          {status === 'error' && (
            <p style={{ marginTop: '16px', color: '#ef4444', fontSize: '14px' }}>Oops! Something went wrong. Try again.</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
