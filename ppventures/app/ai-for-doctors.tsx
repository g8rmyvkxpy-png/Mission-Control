import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Doctors() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>AI for Doctors & Clinics</h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '40px' }}>Automate patient communications. Save 10+ hours every week.</p>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {['📞 Appointment Booking - 24/7 phone scheduling', '🔔 Auto Reminders - Reduce no-shows by 80%', '💊 Prescription Follow-up - Never miss a refill', '📋 Patient Intake - Auto forms & triage', '📊 Analytics - Track patient trends'].map((f, i) => (
            <div key={i} style={{ background: '#1a1a1d', padding: '20px', borderRadius: '12px', border: '1px solid #27272a', fontSize: '18px' }}>{f}</div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/ai-ops#contact" style={{ display: 'inline-block', padding: '16px 32px', background: '#10b981', borderRadius: '12px', color: '#fff', fontWeight: '700', textDecoration: 'none' }}>Get Free Demo →</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
