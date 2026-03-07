import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact - PPVentures',
  description: 'Get in touch with us.',
};

export default function ContactPage({ searchParams }: { searchParams: { agent?: string } }) {
  const agentName = searchParams.agent || '';
  
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="hero" style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <h1>Get in<br/><span>Touch</span></h1>
        <p>Have questions? Lets talk.</p>
        {agentName && (
          <p style={{ color: '#f97316', marginTop: '16px' }}>
          Inquiry about: {agentName}
        </p>
        )}
      </div>
      
      <section style={{ paddingTop: 0, maxWidth: 800 }}>
        <div className="card">
          <h2 style={{ marginBottom: 24, fontSize: 24 }}>Send us a Message</h2>
          <form action="/api/leads" method="POST">
            <input type="hidden" name="agent" value={agentName} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input type="text" name="name" placeholder="Your name *" required />
              <input type="email" name="email" placeholder="Email *" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <input type="text" name="company" placeholder="Company" />
              <select name="service">
                <option value="">Select service</option>
                <option value="ai-agents">AI Agent Development</option>
                <option value="venture-building">Venture Building</option>
                <option value="consulting">Technical Consulting</option>
              </select>
            </div>
            <textarea name="message" rows={6} placeholder={agentName ? `I'm interested in deploying ${agentName}...` : "Your message..."} required />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
