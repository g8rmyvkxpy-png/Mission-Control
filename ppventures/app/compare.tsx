import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Compare() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' }}>
          Why Choose PPVentures?
        </h1>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid #333' }}>Feature</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid #333', color: '#10b981' }}>PPVentures</th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid #666' }}>Others</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Custom AI Agents', '✓', 'Limited'],
              ['24/7 Support', '✓', '✗'],
              ['No Setup Fees', '✓', '✗'],
              ['Cancel Anytime', '✓', '✗'],
              ['Indian Payments', '✓', '✗'],
              ['Fast Setup (3-7 days)', '✓', '30+ days'],
              ['Dedicated Manager', '✓', '✗'],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '16px', borderBottom: '1px solid #333' }}>{row[0]}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #333', textAlign: 'center', color: '#10b981' }}>{row[1]}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #333', textAlign: 'center', color: '#666' }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/ai-ops#contact" style={{ display: 'inline-block', padding: '16px 32px', background: '#10b981', borderRadius: '12px', color: '#fff', fontWeight: '700', textDecoration: 'none' }}>Get Started →</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
