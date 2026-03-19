'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const caseStudies = [
  {
    company: 'TechStart Consulting',
    industry: 'IT Consulting',
    owner: 'Rahul Mehta, Founder',
    icon: '💼',
    challenge: 'Rahul was spending 3-4 hours daily on lead follow-ups and meeting scheduling. His team had no centralized view of prospects.',
    solution: 'Built an AI agent system that automatically qualifies inbound leads, sends personalized follow-up sequences, and schedules calls via Google Calendar integration.',
    results: [
      { metric: '92%', label: 'Reduction in lead response time', detail: 'From 4 hours to 18 minutes' },
      { metric: '15hrs', label: 'Saved per week', detail: 'Across the sales team' },
      { metric: '3x', label: 'More demos booked', detail: 'Same traffic, better conversion' },
    ],
    testimonial: "Our pipeline went from chaotic email threads to a clean automated system. I can finally focus on closing deals instead of chasing leads.",
    timeline: 'Deployed in 5 days',
    category: 'sales-automation',
  },
  {
    company: 'GrowthLab Agency',
    industry: 'Digital Marketing Agency',
    owner: 'Priya Sharma, Operations Director',
    icon: '🚀',
    challenge: 'Managing client reporting was a nightmare. Each client needed a custom report, taking 4-6 hours per month per client. With 12 clients, that was a full week of work every month.',
    solution: 'Automated report generation pulling data from Google Ads, Meta Ads, and Google Analytics. Reports are generated and emailed every Monday morning automatically.',
    results: [
      { metric: '28hrs', label: 'Saved per month', detail: 'On reporting alone' },
      { metric: '12', label: 'Clients receiving reports', detail: 'Every Monday, 8 AM sharp' },
      { metric: '100%', label: 'On-time delivery', detail: 'Never missed a weekly send' },
    ],
    testimonial: "What used to take our team an entire Friday is now fully automated. Reports go out before we're even at our desks.",
    timeline: 'Deployed in 4 days',
    category: 'reporting-automation',
  },
  {
    company: 'CloudNine Real Estate',
    industry: 'Real Estate',
    owner: 'Arjun Patel, CEO',
    icon: '🏠',
    challenge: 'Real estate leads come from multiple sources — website forms, MagicBricks, 99acres, walk-ins. They were losing leads because manual follow-up took too long.',
    solution: 'Built a unified lead pipeline with WhatsApp automation. Property inquiries get instant WhatsApp responses with photos, pricing, and availability. Follow-ups are personalized based on budget and location preferences.',
    results: [
      { metric: '₹12L', label: 'Estimated revenue captured', detail: 'In the first quarter post-deployment' },
      { metric: '<2min', label: 'Lead response time', detail: 'Down from 4+ hours' },
      { metric: '67%', label: 'Increase in site visits', detail: 'From the same lead volume' },
    ],
    testimonial: "We were skeptical about AI, but PPVentures delivered in 5 days what our internal team couldn't do in 2 months. The WhatsApp automation alone has been a game-changer.",
    timeline: 'Deployed in 7 days',
    category: 'lead-automation',
  },
  {
    company: 'HealthFirst Clinic',
    industry: 'Healthcare',
    owner: 'Dr. Ananya Rao, Founder',
    icon: '🩺',
    challenge: 'Appointment reminders were manual. No-shows were running at 30%. The front desk was overwhelmed with calls for booking and prescription refills.',
    solution: 'Automated appointment reminders via SMS and WhatsApp. Prescription refill requests handled via a WhatsApp bot. Patient records updated in Google Sheets automatically.',
    results: [
      { metric: '22%', label: 'Drop in no-show rate', detail: 'From 30% to 8%' },
      { metric: '8hrs', label: 'Front desk time saved', detail: 'Per week' },
      { metric: '94%', label: 'Patient satisfaction', detail: 'Post-automation survey' },
    ],
    testimonial: "Our patients love the reminder system. We went from 3-4 no-shows per day to maybe one per week. The automation pays for itself every single week.",
    timeline: 'Deployed in 6 days',
    category: 'process-automation',
  },
  {
    company: 'RetailMart',
    industry: 'E-commerce',
    owner: 'Vikram Singh, Co-founder',
    icon: '🛒',
    challenge: 'Order processing required manual entry into three systems. Shipping updates were sent manually. Returns were handled via email with no tracking.',
    solution: 'End-to-end order automation connecting Shopify, inventory management, and shipping providers. Returns processed via an automated workflow with customer notifications at each step.',
    results: [
      { metric: '6hrs', label: 'Daily order processing', detail: 'Reduced from 4 hours manual entry' },
      { metric: '99.2%', label: 'Shipping accuracy', detail: 'Up from ~95%' },
      { metric: '4hrs', label: 'Saved per day', detail: 'On customer updates' },
    ],
    testimonial: "We process 200+ orders daily. The automation means our team can focus on customer service instead of data entry.",
    timeline: 'Deployed in 8 days',
    category: 'process-automation',
  },
  {
    company: 'FinServe Advisors',
    industry: 'Financial Services',
    owner: 'Meera Joshi, Managing Partner',
    icon: '📊',
    challenge: 'Compliance documentation for client onboarding took 2-3 days per client. The team was drowning in paperwork and follow-up emails.',
    solution: 'Automated KYC document collection via a secure portal. Compliance checklists completed automatically. Onboarding status tracked in a shared dashboard.',
    results: [
      { metric: '2days', label: 'Onboarding time', detail: 'Reduced from 2-3 days to same day' },
      { metric: '40%', label: 'Reduction in docs errors', detail: 'Automated validation' },
      { metric: '18', label: 'Clients onboarded/month', detail: 'Up from 8 previously' },
    ],
    testimonial: "We went from 2-3 day onboarding to same-day completion. Our compliance team is finally not overwhelmed.",
    timeline: 'Deployed in 10 days',
    category: 'process-automation',
  },
];

const categoryLabels: Record<string, string> = {
  'sales-automation': 'Sales Automation',
  'reporting-automation': 'Reporting',
  'lead-automation': 'Lead Generation',
  'process-automation': 'Process Automation',
};

const categoryColors: Record<string, string> = {
  'sales-automation': '#f97316',
  'reporting-automation': '#8b5cf6',
  'lead-automation': '#10b981',
  'process-automation': '#06b6d4',
};

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filtered = selectedCategory
    ? caseStudies.filter((cs) => cs.category === selectedCategory)
    : caseStudies;

  const categories = ['', ...Object.keys(categoryLabels)];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />

      {/* Hero */}
      <div style={{ padding: '140px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '600' }}>📊 Real Results</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Case Studies
        </h1>

        <p style={{
          color: '#a1a1aa',
          fontSize: 'clamp(15px, 2vw, 18px)',
          maxWidth: '580px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Real businesses. Real automations. Real time and revenue saved.
          No vanity metrics — just the numbers that matter.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ padding: '0 20px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 20px',
                background: selectedCategory === cat ? '#10b981' : '#1a1a1d',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? '600' : '400',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              {cat === '' ? 'All' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Case Studies List */}
      <section style={{ padding: '0 20px 80px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {filtered.map((cs, i) => (
          <article
            key={i}
            style={{
              background: '#1a1a1d',
              borderRadius: '20px',
              padding: '40px',
              marginBottom: '32px',
              border: '1px solid #27272a',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '40px' }}>{cs.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{cs.company}</h2>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    background: categoryColors[cs.category] || '#27272a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {categoryLabels[cs.category]}
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                  {cs.industry} · {cs.owner}
                </p>
              </div>
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                color: '#10b981',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}>
                ⏱ {cs.timeline}
              </div>
            </div>

            {/* Challenge / Solution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>❌ The Problem</div>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>{cs.challenge}</p>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>✅ The Solution</div>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>{cs.solution}</p>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {cs.results.map((r, j) => (
                <div key={j} style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>{r.metric}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{r.detail}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '20px',
              borderLeft: '3px solid #10b981',
            }}>
              <p style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '12px' }}>
                &quot;{cs.testimonial}&quot;
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>— {cs.owner}</p>
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '0 20px 100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
          Want results like these?
        </h2>
        <p style={{ color: '#a1a1aa', marginBottom: '28px' }}>
          Tell us what you want to automate. We&apos;ll show you what&apos;s possible.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" style={{
            padding: '14px 28px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            textDecoration: 'none',
          }}>
            Talk to Us →
          </Link>
          <Link href="/pricing" style={{
            padding: '14px 28px',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '15px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            View Pricing
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
