'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const features = [
  { icon: '🤖', title: 'AI Agents', desc: 'Deploy specialized AI agents for research, content, outreach, and more' },
  { icon: '⚡', title: 'Instant Execution', desc: 'Tasks execute immediately. No waiting in queues' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Track performance, success rates, and agent activity' },
  { icon: '🔌', title: 'API First', desc: 'Integrate with your existing tools via REST API' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'SOC2 compliant with role-based access control' },
  { icon: '📈', title: 'Scale On Demand', desc: 'Add more agents as your needs grow' },
];

export default function LandingPage() {
  return (
    <div className="page">
      <header style={{position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(3,7,18,0.95)', borderBottom: '1px solid #21262d', padding: '16px 24px', zIndex: 1000}}>
        <div style={{maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{fontSize: 28}}>🎯</span>
            <span style={{fontSize: 20, fontWeight: 700}}>Mission Control</span>
          </div>
          <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
            <Link href="/#features" style={{color: '#8b949e', textDecoration: 'none', fontSize: 14}}>Features</Link>
            <Link href="/#pricing" style={{color: '#8b949e', textDecoration: 'none', fontSize: 14}}>Pricing</Link>
            <Link href="/dashboard" className="btn" style={{textDecoration: 'none', padding: '10px 20px', fontSize: 14}}>Get Started</Link>
          </div>
        </div>
      </header>

      <section style={{padding: '160px 24px 100px', textAlign: 'center'}}>
        <div style={{maxWidth: 800, margin: '0 auto'}}>
          <span style={{display: 'inline-block', padding: '8px 16px', background: 'rgba(47,129,247,0.15)', color: '#2f81f7', borderRadius: 20, fontSize: 13, marginBottom: 24}}>AI-Powered Workforce Automation</span>
          <h1 style={{fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, margin: '0 0 24px', lineHeight: 1.1}}>Your AI Workforce,<br/>Running 24/7</h1>
          <p style={{fontSize: 'clamp(16px,2vw,20px)', color: '#8b949e', margin: '0 0 40px', lineHeight: 1.6}}>Deploy AI agents to handle research, content creation, outreach, and more. Scale your operations without scaling your team.</p>
          <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link href="/dashboard" className="btn" style={{padding: '16px 32px', fontSize: 16, textDecoration: 'none'}}>Start Free Trial</Link>
            <Link href="/#features" className="btn" style={{padding: '16px 32px', fontSize: 16, background: 'transparent', border: '1px solid #30363d', textDecoration: 'none'}}>See How It Works</Link>
          </div>
        </div>
      </section>

      <section style={{padding: '60px 24px', background: '#0f1117'}}>
        <div style={{maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32}}>
          {[
            { value: '10x', label: 'Faster Execution' },
            { value: '97%', label: 'Success Rate' },
            { value: '24/7', label: 'AI Availability' },
            { value: '50+', label: 'Tasks Completed' },
          ].map((stat, i) => (
            <div key={i} style={{textAlign: 'center'}}>
              <p style={{fontSize: 40, fontWeight: 700, color: '#2f81f7', margin: 0}}>{stat.value}</p>
              <p style={{color: '#8b949e', margin: '8px 0 0'}}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" style={{padding: '100px 24px'}}>
        <div style={{maxWidth: 1200, margin: '0 auto'}}>
          <h2 style={{fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 16}}>Built for Modern Teams</h2>
          <p style={{fontSize: 18, color: '#8b949e', textAlign: 'center', marginBottom: 60}}>Everything you need to automate your workflow</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24}}>
            {features.map((feature, i) => (
              <div key={i} className="card" style={{padding: 32}}>
                <span style={{fontSize: 40, display: 'block', marginBottom: 16}}>{feature.icon}</span>
                <h3 style={{fontSize: 20, fontWeight: 600, margin: '0 0 12px'}}>{feature.title}</h3>
                <p style={{color: '#8b949e', margin: 0, lineHeight: 1.6}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{padding: '100px 24px', background: '#0f1117'}}>
        <div style={{maxWidth: 1000, margin: '0 auto'}}>
          <h2 style={{fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 16}}>Simple, Transparent Pricing</h2>
          <p style={{fontSize: 18, color: '#8b949e', textAlign: 'center', marginBottom: 48}}>Start free, scale as you grow</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, maxWidth: 800, margin: '0 auto'}}>
            <div className="card" style={{padding: 32}}>
              <h3 style={{fontSize: 20, fontWeight: 600, margin: '0 0 8px'}}>Starter</h3>
              <p style={{color: '#8b949e', marginBottom: 24}}>For individuals</p>
              <p style={{fontSize: 40, fontWeight: 700, margin: '0 0 24px'}}>$9<span style={{fontSize: 16, fontWeight: 400, color: '#8b949e'}}>/mo</span></p>
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px', color: '#8b949e'}}>
                <li style={{padding: '8px 0'}}>✓ 100 tasks/month</li>
                <li style={{padding: '8px 0'}}>✓ 2 AI Agents</li>
                <li style={{padding: '8px 0'}}>✓ Basic analytics</li>
                <li style={{padding: '8px 0'}}>✓ Email support</li>
              </ul>
              <Link href="/dashboard" className="btn" style={{width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none'}}>Get Started</Link>
            </div>
            
            <div className="card" style={{padding: 32, border: '2px solid #2f81f7'}}>
              <span style={{background: '#2f81f7', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block', marginBottom: 12}}>POPULAR</span>
              <h3 style={{fontSize: 20, fontWeight: 600, margin: '0 0 8px'}}>Pro</h3>
              <p style={{color: '#8b949e', marginBottom: 24}}>For growing teams</p>
              <p style={{fontSize: 40, fontWeight: 700, margin: '0 0 24px'}}>$29<span style={{fontSize: 16, fontWeight: 400, color: '#8b949e'}}>/mo</span></p>
              <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px', color: '#f0f6fc'}}>
                <li style={{padding: '8px 0'}}>✓ Unlimited tasks</li>
                <li style={{padding: '8px 0'}}>✓ 5 AI Agents</li>
                <li style={{padding: '8px 0'}}>✓ Priority support</li>
                <li style={{padding: '8px 0'}}>✓ Advanced analytics</li>
                <li style={{padding: '8px 0'}}>✓ API access</li>
              </ul>
              <Link href="/dashboard" className="btn" style={{width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none'}}>Start Free Trial</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding: '100px 24px', textAlign: 'center'}}>
        <div style={{maxWidth: 600, margin: '0 auto'}}>
          <h2 style={{fontSize: 36, fontWeight: 700, marginBottom: 16}}>Ready to Automate?</h2>
          <p style={{fontSize: 18, color: '#8b949e', marginBottom: 32}}>Join teams already saving 10+ hours per week with AI automation.</p>
          <Link href="/dashboard" className="btn" style={{padding: '18px 48px', fontSize: 18, textDecoration: 'none'}}>Start Your Free Trial</Link>
        </div>
      </section>

      <footer style={{padding: '40px 24px', borderTop: '1px solid #21262d', textAlign: 'center'}}>
        <p style={{color: '#8b949e', margin: 0}}>© 2026 PP Ventures. Built with AI.</p>
      </footer>
    </div>
  );
}
