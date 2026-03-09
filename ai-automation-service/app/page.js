'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    niche: '',
    target_audience: '',
    tier: 'starter'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ leads_today: 0, meetings_week: 0, active_clients: 0 });

  // Fetch live stats
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/public/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.log('Could not fetch stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tier: formData.tier })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSubmitted(true);
        // Store client info for success page
        sessionStorage.setItem('pp_new_client', JSON.stringify(data.client));
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <>
        <Head><title>Welcome to PPVentures!</title></Head>
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to PPVentures!</h1>
            <p style={{ fontSize: '1.3rem', color: '#10b981', marginBottom: '2rem' }}>Your AI agents are already working!</p>
            
            <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ marginTop: 0 }}>What happens next:</h3>
              <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
                <span style={{ background: '#10b981', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '50%', fontWeight: 'bold' }}>1</span>
                <span>Right now — agents researching your niche</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '50%', fontWeight: 'bold' }}>2</span>
                <span>In 1 hour — first leads found</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
                <span style={{ background: '#8b5cf6', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '50%', fontWeight: 'bold' }}>3</span>
                <span>Tomorrow morning — daily report arrives</span>
              </div>
            </div>
            
            <a href="http://72.62.231.18:3005" style={{ display: 'inline-block', background: '#10b981', color: '#000', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', marginBottom: '1rem' }}>
              View Your Dashboard →
            </a>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Login credentials sent to your email</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>PPVentures - AI-Powered Business Automation</title>
        <meta name="description" content="Get 10 hours back every week. AI agents run your business while you sleep." />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Navigation */}
        <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 100 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#10b981' }}>PP</span>Ventures
          </div>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#services" style={{ color: '#888', textDecoration: 'none' }}>Services</a>
            <a href="#how-it-works" style={{ color: '#888', textDecoration: 'none' }}>AI Automation</a>
            <a href="#pricing" style={{ color: '#888', textDecoration: 'none' }}>Pricing</a>
            <a href="#trial" style={{ background: '#10b981', color: '#000', padding: '0.5rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>Start Free Trial</a>
          </nav>
        </header>

        {/* Hero */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Get 10 Hours Back Every Week — <br/>
            <span style={{ color: '#10b981' }}>AI Agents Run Your Business While You Sleep</span>
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#888', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            We automatically find leads, research them, write personalized outreach, and follow up — so you can focus on closing deals.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#trial" style={{ background: '#10b981', color: '#000', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none' }}>
              Start My Free 14-Day Trial →
            </a>
            <a href="#demo" style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
              See It In Action
            </a>
          </div>
        </section>

        {/* Social Proof */}
        <section style={{ padding: '2rem', background: '#111', borderTop: '1px solid #222', borderBottom: '1px solid #222', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            ⚡ Powered by the same AI agents that run PPVentures 24/7 
            <span style={{ margin: '0 1rem' }}>|</span> 
            💰 Live in under 5 minutes 
            <span style={{ margin: '0 1rem' }}>|</span> 
            💸 Pays for itself with one new client
          </p>
        </section>

        {/* Problem */}
        <section id="services" style={{ padding: '6rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Sound familiar?</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { icon: '⏰', title: 'Doing $20/hour admin instead of $200/hour work', desc: 'Spreadsheet drudgery is killing your business' },
              { icon: '🥶', title: 'Leads going cold because you can\'t follow up', desc: 'Those leads could have been customers' },
              { icon: '📅', title: 'Spending 3 hours a day scheduling meetings', desc: 'Your time is worth more than calendar management' }
            ].map((item, i) => (
              <div key={i} style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #222', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem' }}>{item.title}</h3>
                  <p style={{ margin: 0, color: '#888' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Solution */}
        <section style={{ padding: '6rem 2rem', background: '#111', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>What if AI handled all of that?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { icon: '🎯', title: 'Find Leads', desc: 'AI researches your ideal customers and finds 10-25 qualified leads every single day' },
                { icon: '📅', title: 'Book Meetings', desc: 'Personalized outreach that actually gets responses and books meetings' },
                { icon: '🔄', title: 'Follow Up Automatically', desc: 'Never lose a lead again. AI follows up until they say yes or no' }
              ].map((item, i) => (
                <div key={i} style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ color: '#888', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{ padding: '6rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
            {[
              { step: '1', title: 'Sign up and tell us your niche', desc: 'Tell us who your ideal customers are and what you offer' },
              { step: '2', title: 'Agents go to work within minutes', desc: 'We immediately start researching and finding leads for you' },
              { step: '3', title: 'You get leads and booked meetings', desc: 'Wake up to new leads, responses, and scheduled meetings' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Our Agents Actually Do - RPA Capabilities */}
        <section id="agents-do" style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto', background: '#0a0a0a', borderRadius: '24px', marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>Your AI Agents Work While You Sleep</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '3rem', fontSize: '1.1rem' }}>Powered by RPA Technology</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🔍', title: 'Lead Scraping', desc: 'Agents browse LinkedIn, Google and directories to find your ideal clients automatically' },
              { icon: '📧', title: 'Personalised Outreach', desc: 'AI writes and sends hyper-personalised messages to every lead' },
              { icon: '📅', title: 'Meeting Booking', desc: 'Agents handle back and forth scheduling so you never miss a lead' },
              { icon: '🕵️', title: 'Competitor Monitoring', desc: 'Agents visit competitor sites daily and alert you to any changes' },
              { icon: '📰', title: 'Industry News', desc: 'Agents scrape the web every morning for news relevant to your business' },
              { icon: '🌐', title: 'Website Audits', desc: 'Weekly automated checks of your site for speed, broken links and SEO issues' }
            ].map((item, i) => (
              <div key={i} style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{item.title}</h3>
                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Demo */}
        <section id="demo" style={{ padding: '4rem 2rem', background: '#111', borderTop: '1px solid #222', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🔥 Live Demo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ padding: '2rem', background: '#0a0a0a', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>{stats.leads_today}</div>
              <div style={{ color: '#888' }}>Leads Found Today</div>
            </div>
            <div style={{ padding: '2rem', background: '#0a0a0a', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.meetings_week}</div>
              <div style={{ color: '#888' }}>Meetings This Week</div>
            </div>
            <div style={{ padding: '2rem', background: '#0a0a0a', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.active_clients}</div>
              <div style={{ color: '#888' }}>Active Clients</div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ padding: '6rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>Simple Pricing</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '3rem' }}>Start free. Upgrade when you're ready.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { tier: 'Starter', price: 297, features: ['10 leads scraped/day', 'Personalised email outreach', 'Daily industry news digest', 'Daily performance report'], color: '#666', popular: false },
              { tier: 'Growth', price: 597, features: ['25 leads scraped/day', 'Email + LinkedIn outreach', 'Daily competitor monitoring', 'Weekly website audit', 'Priority support'], color: '#10b981', popular: true },
              { tier: 'Enterprise', price: 997, features: ['Unlimited lead scraping', 'Full RPA automation suite', 'Custom workflow automation', 'Dedicated agent', 'White-label reports'], color: '#3b82f6', popular: false }
            ].map((p, i) => (
              <div key={i} style={{ background: p.popular ? '#1a1a1a' : '#111', padding: '2.5rem', borderRadius: '16px', border: p.popular ? '2px solid #10b981' : '1px solid #222', position: 'relative' }}>
                {p.popular && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#000', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>MOST POPULAR</span>}
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.tier}</h3>
                <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>${p.price}<span style={{ fontSize: '1rem', fontWeight: '400', color: '#888' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', lineHeight: '2' }}>
                  {p.features.map((f, j) => <li key={j} style={{ color: '#ccc' }}>✓ {f}</li>)}
                </ul>
                <a href="#trial" style={{ display: 'block', background: p.color, color: '#000', padding: '1rem', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '600' }}>Get Started</a>
              </div>
            ))}
          </div>
        </section>

        {/* Trial Signup Form */}
        <section id="trial" style={{ padding: '6rem 2rem', background: '#111', borderTop: '1px solid #222' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>Start Your Free Trial</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem' }}>14 days free. No credit card required.</p>
            
            {error && <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '16px', border: '1px solid #222' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Your Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Email *</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Business Name *</label>
                <input type="text" required value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'ccc' }}>Your Niche *</label>
                <input type="text" required placeholder="e.g., Marketing agencies, SaaS founders" value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'ccc' }}>Target Audience</label>
                <input type="text" placeholder="e.g., Companies with 10-50 employees" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }} />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Select Plan</label>
                <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem' }}>
                  <option value="starter">Starter - $297/mo</option>
                  <option value="growth">Growth - $597/mo</option>
                  <option value="enterprise">Enterprise - $997/mo</option>
                </select>
              </div>
              
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#10b981', color: '#000', padding: '1rem', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating Account...' : 'Start My Free 14-Day Trial →'}
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #222', textAlign: 'center', color: '#666' }}>
          <p>© 2026 PPVentures. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
