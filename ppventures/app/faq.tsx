import Navbar from './components/Navbar';
import Footer from './components/Footer';

const faqs = [
  { q: "How long does setup take?", a: "Most automations are live within 3-7 days. Simple email automations can be set up in 24 hours." },
  { q: "Do I need technical knowledge?", a: "No! We handle all the technical stuff. You just tell us what you want to automate." },
  { q: "What if it doesn't work?", a: "We offer a 100% satisfaction guarantee. If you're not happy, we'll fix it or refund." },
  { q: "Can I cancel anytime?", a: "Yes, no contracts. Cancel anytime with 30 days notice." },
  { q: "How do payments work?", a: "Pay via UPI (Google Pay, PhonePe, Paytm) or bank transfer. Indian-friendly." },
  { q: "What industries do you work with?", a: "Real estate, healthcare, e-commerce, agencies, consultants - any business with repetitive tasks." },
];

export default function FAQ() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '40px' }}>Everything you need to know</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ background: '#1a1a1d', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
              <summary style={{ padding: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                {f.q} <span style={{ color: '#10b981' }}>▼</span>
              </summary>
              <div style={{ padding: '0 20px 20px', color: '#a1a1aa', lineHeight: 1.6 }}>{f.a}</div>
            </details>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px', padding: '24px', background: '#10b98110', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>Still have questions?</p>
          <a href="/contact" style={{ display: 'inline-block', padding: '12px 24px', background: '#10b981', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: '600' }}>Chat with us →</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
