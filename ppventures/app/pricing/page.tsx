'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const dynamic = 'force-dynamic';

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for individuals exploring AI automation.',
    features: [
      '1 user',
      '50 tasks/month',
      'Basic AI chat (local only)',
      '1 project',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For professionals and small teams ready to scale.',
    features: [
      '5 users',
      'Unlimited tasks',
      'AI chat (local + cloud)',
      'Unlimited projects',
      'Basic analytics',
      'API access (100 calls/day)',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For organizations needing full autonomy.',
    features: [
      'Unlimited users',
      'Everything in Pro',
      'Unlimited API calls',
      'White-label solution',
      'Custom domain',
      'Priority support',
      'SSO/SAML',
      'Dedicated infrastructure',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b' }}>
      <Navbar />
      
      {/* Hero */}
      <div style={{ 
        padding: '160px 40px 80px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '20px' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
          Choose the plan that fits your needs. Scale as you grow.
        </p>
      </div>

      {/* Pricing Cards */}
      <section style={{ padding: '40px 40px 120px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              style={{ 
                background: tier.popular ? 'linear-gradient(145deg, #1a1a1d 0%, #27272a 100%)' : '#1a1a1d',
                border: tier.popular ? '2px solid #f97316' : '1px solid #27272a',
                borderRadius: '16px',
                padding: '40px 32px',
                position: 'relative',
              }}
            >
              {tier.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#f97316',
                  color: '#fff',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  Most Popular
                </div>
              )}
              
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{tier.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>{tier.description}</p>
              
              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800' }}>{tier.price}</span>
                <span style={{ color: '#6b7280', fontSize: '16px' }}>{tier.period}</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                {tier.features.map((feature) => (
                  <li key={feature} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px 0',
                    color: '#d4d4d8',
                    fontSize: '15px',
                  }}>
                    <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/contact"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 24px',
                  background: tier.popular ? '#f97316' : '#27272a',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 40px', background: '#1a1a1d' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, Pro comes with a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, UPI, and bank transfers for annual plans.',
              },
              {
                q: 'Can I self-host Mission Control?',
                a: 'Enterprise customers get full self-hosted options. Contact us for details.',
              },
            ].map((faq) => (
              <div key={faq.q} style={{ background: '#0a0a0b', padding: '24px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{faq.q}</h4>
                <p style={{ color: '#a1a1aa', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to go autonomous?
        </h2>
        <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '32px' }}>
          Join 100+ businesses already using our AI agents.
        </p>
        <Link 
          href="/contact"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            background: '#f97316',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '18px',
          }}
        >
          Get Started Free
        </Link>
      </section>

      <Footer />
    </div>
  );
}
