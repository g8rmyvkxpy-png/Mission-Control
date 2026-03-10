'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const dynamic = 'force-dynamic';

const tiers = [
  {
    name: 'Starter',
    priceUSD: 297,
    priceINR: 24750,
    description: 'Perfect for small businesses getting started with AI automation',
    features: [
      { text: '3 AI agents (Neo, Atlas, Orbit)', included: true },
      { text: '10 leads scraped & qualified per day', included: true },
      { text: 'Personalised outreach messages', included: true },
      { text: 'Daily industry news digest', included: true },
      { text: 'Daily performance report', included: true },
      { text: 'Client dashboard access', included: true },
      { text: 'RAG-powered document Q&A', included: true },
      { text: 'Competitor monitoring', included: false },
      { text: 'Website audit', included: false },
      { text: 'Custom workflows', included: false },
      { text: 'Email support', included: true },
    ],
    popular: false,
  },
  {
    name: 'Growth',
    priceUSD: 597,
    priceINR: 49750,
    description: 'For growing agencies and consultants ready to scale',
    features: [
      { text: '3 AI agents (Neo, Atlas, Orbit)', included: true },
      { text: '25 leads scraped & qualified per day', included: true },
      { text: 'Personalised outreach messages', included: true },
      { text: 'Daily industry news digest', included: true },
      { text: 'Daily performance report', included: true },
      { text: 'Client dashboard access', included: true },
      { text: 'RAG-powered document Q&A', included: true },
      { text: 'Daily competitor monitoring', included: true },
      { text: 'Weekly website audit', included: true },
      { text: 'Custom workflows', included: false },
      { text: 'Priority support', included: true },
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    priceUSD: 997,
    priceINR: 83000,
    description: 'For established businesses wanting full automation',
    features: [
      { text: '3 AI agents + custom agents', included: true },
      { text: 'Unlimited lead scraping', included: true },
      { text: 'Personalised outreach messages', included: true },
      { text: 'Daily industry news digest', included: true },
      { text: 'Daily performance report', included: true },
      { text: 'Client dashboard access', included: true },
      { text: 'RAG-powered document Q&A', included: true },
      { text: 'Daily competitor monitoring', included: true },
      { text: 'Weekly website audit', included: true },
      { text: 'Full RPA automation suite', included: true },
      { text: 'Custom agent workflows', included: true },
      { text: 'Dedicated agent configuration', included: true },
      { text: 'Weekly strategy call', included: true },
      { text: 'Dedicated support', included: true },
    ],
    popular: false,
  },
];

const comparisonData = [
  { feature: 'AI Agents', starter: '3', growth: '3', enterprise: '3 + custom' },
  { feature: 'Leads per day', starter: '10', growth: '25', enterprise: 'Unlimited' },
  { feature: 'Outreach messages', starter: '✓', growth: '✓', enterprise: '✓' },
  { feature: 'Daily news digest', starter: '✓', growth: '✓', enterprise: '✓' },
  { feature: 'Competitor monitoring', starter: '✗', growth: '✓', enterprise: '✓' },
  { feature: 'Website audit', starter: '✗', growth: 'Weekly', enterprise: 'Weekly' },
  { feature: 'Custom workflows', starter: '✗', growth: '✗', enterprise: '✓' },
  { feature: 'RAG document Q&A', starter: '✓', growth: '✓', enterprise: '✓' },
  { feature: 'Daily reports', starter: '✓', growth: '✓', enterprise: '✓' },
  { feature: 'Support', starter: 'Email', growth: 'Priority', enterprise: 'Dedicated' },
  { feature: 'Price', starter: '$297/mo', growth: '$597/mo', enterprise: '$997/mo' },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — all plans include a 14-day free trial. No credit card required to start.' },
  { q: 'How quickly do agents start working?', a: 'Agents are configured and running within minutes of signup. You will see your first leads within 24 hours.' },
  { q: 'What AI model do the agents use?', a: 'Our agents run on Minimax M2.5, a powerful AI model optimised for business tasks.' },
  { q: 'Can I see what agents are doing?', a: 'Yes — every plan includes a client dashboard where you can see every action your agents take in real time.' },
  { q: 'What if I want to cancel?', a: 'You can cancel anytime. No long-term contracts.' },
  { q: 'Do you offer custom pricing for larger teams?', a: 'Yes — contact us for custom enterprise pricing if you need something beyond our standard plans.' },
];

const consultingServices = [
  { name: 'AI Strategy Consultation', price: '₹2,49,000', desc: 'AI roadmap, architecture review, tech stack selection, MVP planning' },
  { name: 'Custom AI Agent Development', price: 'Starting at ₹41,500', desc: 'Custom agents built for your specific workflows' },
];

export default function Pricing() {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (tier: typeof tiers[0]) => {
    const base = currency === 'USD' ? tier.priceUSD : tier.priceINR;
    if (billing === 'annual') return Math.round(base * 0.8);
    return base;
  };

  const formatPrice = (price: number) => {
    if (currency === 'USD') return `$${price}`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{ padding: '160px 40px 60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', marginBottom: '16px' }}>
          Simple, transparent <span style={{ color: '#10b981' }}>pricing</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Choose the plan that fits your needs. Scale as you grow.
        </p>

        {/* Toggle */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#1a1a1d', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setBilling('monthly')}
              style={{ padding: '8px 16px', background: billing === 'monthly' ? '#10b981' : 'transparent', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling('annual')}
              style={{ padding: '8px 16px', background: billing === 'annual' ? '#10b981' : 'transparent', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
            >
              Annual <span style={{ fontSize: '12px', opacity: 0.8 }}>(-20%)</span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#1a1a1d', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setCurrency('USD')}
              style={{ padding: '8px 16px', background: currency === 'USD' ? '#10b981' : 'transparent', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
            >
              USD
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              style={{ padding: '8px 16px', background: currency === 'INR' ? '#10b981' : 'transparent', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
            >
              INR
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <section style={{ padding: '40px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              style={{ 
                background: tier.popular ? 'linear-gradient(145deg, #1a1a1d 0%, #0f1512 100%)' : '#1a1a1d',
                border: tier.popular ? '2px solid #10b981' : '1px solid #27272a',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative',
                boxShadow: tier.popular ? '0 0 40px rgba(16, 185, 129, 0.15)' : 'none',
              }}
            >
              {/* Badge */}
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {tier.popular && (
                  <div style={{ background: '#10b981', color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>
                  14-day free trial
                </div>
              </div>
              
              <h3 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px', marginTop: '16px' }}>{tier.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px', minHeight: '40px' }}>{tier.description}</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800' }}>{formatPrice(getPrice(tier))}</span>
                <span style={{ color: '#6b7280', fontSize: '16px' }}>/month</span>
                {billing === 'annual' && (
                  <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px' }}>Billed annually</div>
                )}
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                {tier.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', color: feature.included ? '#d4d4d8' : '#52525b', fontSize: '14px' }}>
                    <span style={{ color: feature.included ? '#10b981' : '#52525b', fontSize: '16px', width: '20px', textAlign: 'center' }}>
                      {feature.included ? '✓' : '✗'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/automation"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 24px',
                  background: tier.popular ? '#10b981' : '#27272a',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Compare Plans</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #27272a', color: '#a1a1aa', fontWeight: '600' }}>Feature</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #27272a', color: '#fff', fontWeight: '600' }}>Starter</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #27272a', color: '#10b981', fontWeight: '600' }}>Growth</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #27272a', color: '#fff', fontWeight: '600' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>{row.feature}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #27272a', color: '#fff', textAlign: 'center' }}>{row.starter}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #27272a', color: '#10b981', textAlign: 'center', fontWeight: '600' }}>{row.growth}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #27272a', color: '#fff', textAlign: 'center' }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Consulting */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Consulting & Custom Development</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {consultingServices.map((service, i) => (
              <div key={i} style={{ background: '#1a1a1d', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{service.name}</h4>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{service.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>{service.price}</span>
                  <Link href="/contact" style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                    Book a Call
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 20px', background: '#0d0d0f' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
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
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '700', marginBottom: '16px' }}>
          Start your 14-day free trial today
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '32px' }}>
          No credit card required · Cancel anytime · Setup in minutes
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/automation" style={{ padding: '16px 32px', background: '#10b981', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
            Start Free Trial
          </Link>
          <Link href="/contact" style={{ padding: '16px 32px', background: 'transparent', border: '2px solid #3f3f46', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
            Talk to Us First
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
