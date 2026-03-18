import Navbar from './components/Navbar';
import Footer from './components/Footer';

const testimonials = [
  { name: "Rahul Mehta", company: "TechStart Consulting", result: "+$30K/quarter", text: "Our lead response time dropped from 4 hours to 2 minutes." },
  { name: "Priya Sharma", company: "GrowthLab Agency", result: "15 hrs/week saved", text: "Email automation alone saves our team 15 hours every week." },
  { name: "Arjun Patel", company: "CloudNine Real Estate", result: "5x faster", text: "PPVentures delivered in 5 days what our team couldn't do in 2 months." },
];

export default function Testimonials() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>What Clients Say</h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '40px' }}>Real results from real businesses</p>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', border: '1px solid #27272a' }}>
              <p style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.6 }}>"{t.text}"</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{t.name}</div>
                  <div style={{ color: '#10b981' }}>{t.company}</div>
                </div>
                <div style={{ background: '#10b98120', padding: '8px 16px', borderRadius: '8px', color: '#10b981', fontWeight: '600' }}>{t.result}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
