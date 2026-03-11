import { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Privacy Policy | PPVentures',
  description: 'Privacy Policy - PPVentures - How we collect, use, and protect your data.',
};

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div style={{ padding: '140px 40px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '32px' }}>Privacy Policy</h1>
          
          <section style={{ marginBottom: '32px' }}>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '24px' }}>
              At PPVentures, we take your privacy seriously. This policy outlines how we collect, use, and protect your data when you use our AI agent services.
            </p>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              Last updated: March 11, 2026
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Data We Collect</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Contact Information:</strong> Name, email, phone number, and company details when you sign up or contact us</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Business Data:</strong> Information you provide about your business, target customers, and automation requirements</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Usage Data:</strong> How you interact with our dashboard, agents, and services</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Lead Data:</strong> Information about leads our agents find and process on your behalf</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>How We Use Your Data</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>To provide and maintain our AI agent services</li>
              <li style={{ marginBottom: '8px' }}>To generate leads and perform outreach as per your requirements</li>
              <li style={{ marginBottom: '8px' }}>To personalize your experience and improve our services</li>
              <li style={{ marginBottom: '8px' }}>To communicate with you about your account and provide support</li>
              <li style={{ marginBottom: '8px' }}>To monitor competitors and deliver industry news you request</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Data Protection</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '16px' }}>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li style={{ marginBottom: '8px' }}>Access restricted to authorized personnel only</li>
              <li style={{ marginBottom: '8px' }}>Regular security audits and vulnerability assessments</li>
              <li style={{ marginBottom: '8px' }}>Lead data is processed solely for your specified purposes</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Your Rights</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '16px' }}>
              Under GDPR (EU), DPDPA (India), and similar regulations, you have the right to:
            </p>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Access the personal data we hold about you</li>
              <li style={{ marginBottom: '8px' }}>Request correction of inaccurate data</li>
              <li style={{ marginBottom: '8px' }}>Request deletion of your data ("Right to be forgotten")</li>
              <li style={{ marginBottom: '8px' }}>Object to processing of your personal data</li>
              <li style={{ marginBottom: '8px' }}>Data portability - receive your data in a structured format</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Contact Us</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              For data protection inquiries or to exercise your rights, contact us at:<br />
              <strong style={{ color: '#10b981' }}>Email:</strong> privacy@ppventures.tech<br />
              <strong style={{ color: '#10b981' }}>Address:</strong> PPVentures, India
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
