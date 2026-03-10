import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | PPVentures',
  description: 'Terms of Service - PPVentures',
};

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', padding: '120px 40px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '32px' }}>Terms of Service</h1>
        <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '24px' }}>
          By using PPVentures services, you agree to our terms. This document outlines the agreement between PPVentures and our clients.
        </p>
        <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
