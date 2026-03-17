import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPost() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
          How Small Businesses Can Use AI Agents to 10x Revenue
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>March 17, 2026 • By PPVentures</p>
        
        <div style={{ lineHeight: 1.8, fontSize: '18px', color: '#d4d4d8' }}>
          <p>Small businesses often struggle with limited resources. Here's how AI agents can help:</p>
          
          <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '16px' }}>1. Customer Support 24/7</h2>
          <p>AI agents can handle customer queries round the clock, saving you hours every day.</p>
          
          <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '16px' }}>2. Automated Lead Follow-up</h2>
          <p>Never miss a lead again. AI agents can follow up within 2 minutes of someone visiting your site.</p>
          
          <h2 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '16px' }}>3. Content Creation</h2>
          <p>Generate blog posts, social media content, and emails automatically.</p>
          
          <div style={{ background: '#1a1a1d', padding: '24px', borderRadius: '12px', marginTop: '40px', border: '1px solid #10b981' }}>
            <h3 style={{ marginTop: 0 }}>Ready to get started?</h3>
            <p>Start with our ₹500 UPI payment and get a free consultation.</p>
            <a href="/pricing" style={{ display: 'inline-block', marginTop: '12px', padding: '12px 24px', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
              Get Started →
            </a>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}
