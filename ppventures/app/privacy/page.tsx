import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PPVentures',
  description: 'Privacy Policy - PPVentures',
};

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', padding: '120px 40px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '32px' }}>Privacy Policy</h1>
        <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '24px' }}>
          At PPVentures, we take your privacy seriously. This policy outlines how we collect, use, and protect your data.
        </p>
        <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
