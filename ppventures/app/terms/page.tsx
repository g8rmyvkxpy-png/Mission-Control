import { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Terms of Service | PPVentures',
  description: 'Terms of Service - PPVentures - Service agreement between PPVentures and clients.',
};

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div style={{ padding: '140px 40px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '32px' }}>Terms of Service</h1>
          
          <section style={{ marginBottom: '32px' }}>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '24px' }}>
              By using PPVentures AI agent services, you agree to these terms. Please read them carefully before signing up.
            </p>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              Last updated: March 11, 2026
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Service Description</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              PPVentures provides AI-powered automation services including lead generation, outreach messaging, competitor monitoring, research, and operational tasks. Our AI agents perform these tasks autonomously based on your configuration and requirements.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Free Trial</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>14-day free trial with full access to all features</li>
              <li style={{ marginBottom: '8px' }}>No credit card required to start</li>
              <li style={{ marginBottom: '8px' }}>Agents start working within minutes of signup</li>
              <li style={{ marginBottom: '8px' }}>You can cancel anytime during or after the trial</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Billing & Payment</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Automation Suite:</strong> $297/month (billed monthly)</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Mission Control:</strong> ₹16,500/month (billed monthly in INR)</li>
              <li style={{ marginBottom: '8px' }}>Payment due on the first day of each billing cycle</li>
              <li style={{ marginBottom: '8px' }}>Prices are exclusive of applicable taxes</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Cancellation</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Cancel anytime from your dashboard or by contacting support</li>
              <li style={{ marginBottom: '8px' }}>No cancellation fees</li>
              <li style={{ marginBottom: '8px' }}>Access continues until end of current billing period</li>
              <li style={{ marginBottom: '8px' }}>Data deleted within 30 days of cancellation</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Acceptable Use</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, marginBottom: '16px' }}>
              You agree NOT to use our services for:
            </p>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Illegal activities or fraud</li>
              <li style={{ marginBottom: '8px' }}>Spam or unsolicited communications</li>
              <li style={{ marginBottom: '8px' }}>Harassment or abusive behavior</li>
              <li style={{ marginBottom: '8px' }}>Violating third-party rights</li>
              <li style={{ marginBottom: '8px' }}>Testing or probing vulnerabilities without authorization</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Intellectual Property</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Your Data:</strong> You retain ownership of all data you provide and leads generated</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Our Technology:</strong> PPVentures platform, agents, and processes are proprietary</li>
              <li style={{ marginBottom: '8px' }}><strong style={{ color: '#fff' }}>Generated Content:</strong> Outreach messages and reports generated for you are yours to use</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Service Level</h2>
            <ul style={{ color: '#a1a1aa', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>We aim for 99.9% uptime for the dashboard and agent services</li>
              <li style={{ marginBottom: '8px' }}>Scheduled maintenance will be announced in advance</li>
              <li style={{ marginBottom: '8px' }}>Agent performance depends on AI API availability (OpenAI, Minimax)</li>
              <li style={{ marginBottom: '8px' }}>Support response time: within 24 hours on business days</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Limitation of Liability</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              PPVentures services are provided "as is". We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the last 12 months.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>Contact</h2>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
              For questions about these terms, contact us at:<br />
              <strong style={{ color: '#10b981' }}>Email:</strong> legal@ppventures.tech
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
