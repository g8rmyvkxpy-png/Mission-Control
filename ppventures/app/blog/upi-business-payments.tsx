import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPost() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
          Accept UPI Payments for Your Business - The Complete Guide
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>March 17, 2026 • By PPVentures</p>
        
        <div style={{ lineHeight: 1.8, fontSize: '18px', color: '#d4d4d8' }}>
          <p>UPI has revolutionized payments in India. Here's how to use it for your business:</p>
          
          <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '16px' }}>Why UPI?</h2>
          <ul>
            <li>Instant settlements</li>
            <li>Zero transaction fees (for now)</li>
            <li>Universal acceptance</li>
            <li>No card machine needed</li>
          </ul>
          
          <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '16px' }}>How to Accept UPI</h2>
          <p>Simply share your UPI ID with customers. They can pay via Google Pay, PhonePe, Paytm, or any UPI app.</p>
          
          <div style={{ background: '#1a1a1d', padding: '24px', borderRadius: '12px', marginTop: '40px', border: '1px solid #10b981' }}>
            <h3 style={{ marginTop: 0 }}>Need help setting up AI-powered payment flows?</h3>
            <a href="/ai-ops" style={{ display: 'inline-block', marginTop: '12px', padding: '12px 24px', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
              Talk to an Expert →
            </a>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
