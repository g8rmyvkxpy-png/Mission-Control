import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Performance Dashboard - PPVentures',
  description: 'Venture health metrics and SaaS performance',
};

// Mock SaaS metrics - in production, fetch from Supabase
const metrics = {
  mrr: 0,
  activeCustomers: 0,
  churnRate: 0,
  activeAgents: 21,
  newSignups: 0,
  revenue: [
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dec', value: 0 },
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
  ]
};

const plans = [
  { name: 'Basic', price: 29, color: '#3b82f6' },
  { name: 'Pro', price: 99, color: '#8b5cf6' },
  { name: 'Ultra', price: 299, color: '#f97316' },
];

export default function PerformanceDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0b',
      color: '#fafafa',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #27272a'
      }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '700' }}>
          PP<span style={{ color: '#f97316' }}>Ventures</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/mission-control" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
            ← Mission Control
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header style={{
        padding: '48px 40px',
        borderBottom: '1px solid #27272a'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
          📊 Venture Performance
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px' }}>
          SaaS metrics and venture health • No personal data
        </p>
      </header>

      {/* Key Metrics */}
      <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {/* MRR */}
        <div style={{
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            Monthly Recurring Revenue
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e' }}>
            ${metrics.mrr.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Target: $1M ARR
          </div>
        </div>

        {/* Active Customers */}
        <div style={{
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            Active Customers
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>
            {metrics.activeCustomers}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            +{metrics.newSignups} this month
          </div>
        </div>

        {/* Churn Rate */}
        <div style={{
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            Churn Rate
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: metrics.churnRate > 5 ? '#ef4444' : '#22c55e' }}>
            {metrics.churnRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Industry avg: 5%
          </div>
        </div>

        {/* Active Agents */}
        <div style={{
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            Active AI Agents
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6' }}>
            {metrics.activeAgents}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            Working 24/7
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <section style={{ padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Revenue Trend
        </h2>
        <div style={{
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid #27272a',
          height: '200px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px'
        }}>
          {metrics.revenue.map((item, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '100%',
                background: '#27272a',
                borderRadius: '4px',
                height: `${(item.value / Math.max(...metrics.revenue.map(m => m.value || 1))) * 150}px`,
                minHeight: '4px'
              }} />
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Plans */}
      <section style={{ padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Pricing Plans
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: '#1a1a1d',
              borderRadius: '12px',
              padding: '32px',
              border: `1px solid ${plan.color}40`
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {plan.name}
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: plan.color }}>
                ${plan.price}
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>/mo</span>
              </div>
              <ul style={{ marginTop: '24px', listStyle: 'none' }}>
                <li style={{ marginBottom: '12px', color: '#a1a1aa', fontSize: '14px' }}>✓ AI Agents</li>
                <li style={{ marginBottom: '12px', color: '#a1a1aa', fontSize: '14px' }}>✓ 24/7 Support</li>
                <li style={{ marginBottom: '12px', color: '#a1a1aa', fontSize: '14px' }}>✓ Analytics</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Security Notice */}
      <div style={{
        padding: '24px 40px',
        borderTop: '1px solid #27272a',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        🔒 This dashboard shows ONLY SaaS venture metrics. Personal assets are stored separately and inaccessible.
      </div>
    </div>
  );
}
