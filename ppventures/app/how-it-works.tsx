import Navbar from './components/Navbar';
import Footer from './components/Footer';

const steps = [
  { num: '1', title: 'Share Your Goals', desc: 'Tell us what tasks you want to automate. We listen and understand your business needs.' },
  { num: '2', title: 'We Build Your AI', desc: 'Our team creates custom AI agents tailored to your workflow. Setup takes 3-7 days.' },
  { num: '3', title: 'AI Goes to Work', desc: 'Your AI agents start working immediately. Monitor progress through your dashboard.' },
  { num: '4', title: 'You Save Time', desc: 'Wake up to completed tasks. Save 10+ hours every week. Focus on growing your business.' },
];

const benefits = [
  '✓ Save 10+ hours per week',
  '✓ 24/7 automation',
  '✓ No technical setup needed',
  '✓ Cancel anytime',
  '✓ Free support',
  '✓ Regular improvements',
];

export default function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>How It Works</h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '60px' }}>Get started in 4 simple steps</p>
        
        <div style={{ display: 'grid', gap: '24px', marginBottom: '60px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '16px' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ background: '#1a1a1d', borderRadius: '24px', padding: '40px', border: '1px solid #10b981' }}>
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '24px' }}>What's Included</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ fontSize: '16px', color: '#10b981' }}>{b}</div>
            ))}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/ai-ops#contact" style={{ display: 'inline-block', padding: '16px 32px', background: '#10b981', borderRadius: '12px', color: '#fff', fontWeight: '700', fontSize: '18px', textDecoration: 'none' }}>Get Started →</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
