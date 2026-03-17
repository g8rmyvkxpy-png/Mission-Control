import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPost() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
          10 Tasks You Should Automate Today (And Save 10+ Hours/Week)
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>March 17, 2026 • By PPVentures</p>
        
        <div style={{ lineHeight: 1.8, fontSize: '18px', color: '#d4d4d8' }}>
          <p>Stop wasting time on repetitive tasks. Here's what to automate first:</p>
          
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '16px' }}><strong>Email responses</strong> - Auto-reply to common queries</li>
            <li style={{ marginBottom: '16px' }}><strong>Lead follow-up</strong> - Contact leads within 2 minutes</li>
            <li style={{ marginBottom: '16px' }}><strong>Appointment scheduling</strong> - Let AI handle bookings</li>
            <li style={{ marginBottom: '16px' }}><strong>Invoice generation</strong> - Auto-create and send invoices</li>
            <li style={{ marginBottom: '16px' }}><strong>Social media posting</strong> - Schedule across platforms</li>
            <li style={{ marginBottom: '16px' }}><strong>Report generation</strong> - Auto-compile weekly reports</li>
            <li style={{ marginBottom: '16px' }}><strong>Data entry</strong> - Sync data between apps</li>
            <li style={{ marginBottom: '16px' }}><strong>Customer onboarding</strong> - Welcome sequences</li>
            <li style={{ marginBottom: '16px' }}><strong>Feedback collection</strong> - Auto-send follow-ups</li>
            <li style={{ marginBottom: '16px' }}><strong>Meeting notes</strong> - AI summaries after calls</li>
          </ol>
          
          <div style={{ background: '#1a1a1d', padding: '24px', borderRadius: '12px', marginTop: '40px', border: '1px solid #10b981' }}>
            <h3 style={{ marginTop: 0 }}>Need help automating?</h3>
            <p>Get a free audit of what you can automate.</p>
            <a href="/ai-ops" style={{ display: 'inline-block', marginTop: '12px', padding: '12px 24px', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
              Get Free Audit →
            </a>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
