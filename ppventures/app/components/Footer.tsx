import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      padding: '48px 40px',
      borderTop: '1px solid #27272a',
      background: '#0a0a0b',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            PP<span style={{ color: '#f97316' }}>Ventures</span>
          </h4>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Building the autonomous future with AI-powered companies.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/ai-agents" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>AI Agents</Link>
            <Link href="/services" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Services</Link>
            <Link href="/blog" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Blog</Link>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Company</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/contact" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Contact</Link>
            <Link href="/about" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>About</Link>
            <a href="#" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Careers</a>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Legal</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="#" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #27272a', color: '#6b7280', fontSize: '14px' }}>
        © 2026 PPVentures. All rights reserved.
      </div>
    </footer>
  );
}
