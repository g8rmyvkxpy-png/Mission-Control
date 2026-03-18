import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function ContactSimple() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>Get In Touch</h1>
        <p style={{ fontSize: '18px', color: '#a1a1aa', textAlign: 'center', marginBottom: '40px' }}>We'd love to hear from you</p>
        
        <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>📧 Email</h2>
          <a href="mailto:hello@ppventures.tech" style={{ color: '#10b981', fontSize: '18px' }}>hello@ppventures.tech</a>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>We reply within 24 hours</p>
        </div>
        
        <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>💬 WhatsApp</h2>
          <a href="https://wa.me/919999999999" style={{ color: '#10b981', fontSize: '18px' }}>+91 XXXXX XXXXX</a>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Fast responses</p>
        </div>
        
        <div style={{ background: '#1a1a1d', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>🏠 Location</h2>
          <p style={{ color: '#a1a1aa' }}>India (Remote First)</p>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>We work with clients worldwide</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
