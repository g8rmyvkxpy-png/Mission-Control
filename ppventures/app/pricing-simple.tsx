import Navbar from './components/Navbar';
import Footer from './components/Footer';

const plans = [
  { name: 'Starter', price: '₹5,000', period: '/month', features: ['1 AI Agent', '100 tasks/month', 'Email support', 'Basic analytics'], popular: false },
  { name: 'Professional', price: '₹15,000', period: '/month', features: ['3 AI Agents', 'Unlimited tasks', 'Priority support', 'Advanced analytics', 'Custom integrations'], popular: true },
  { name: 'Enterprise', price: '₹50,000', period: '/month', features: ['Unlimited Agents', 'Dedicated manager', '24/7 phone support', 'Custom development', 'SLA guarantee'], popular: false },
];

export default function PricingSimple() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>Simple, Transparent Pricing</h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '40px' }}>Choose the plan that fits your needs</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: plan.popular ? '2px solid #10b981' : '1px solid #27272a', position: 'relative' }}>
              {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>MOST POPULAR</div>}
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{plan.name}</h2>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800' }}>{plan.price}</span>
                <span style={{ color: '#6b7280' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '8px 0', color: '#a1a1aa' }}>✓ {f}</li>
                ))}
              </ul>
              <a href="/ai-ops#contact" style={{ display: 'block', padding: '14px', background: plan.popular ? '#10b981' : '#27272a', borderRadius: '8px', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: '600' }}>Get Started</a>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
