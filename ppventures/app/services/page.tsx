import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Services & Products - PPVentures',
  description: 'AI agent development, technical consulting, and Mission Control - your autonomous company platform.',
  openGraph: {
    title: 'Services & Products - PPVentures',
    description: 'AI agent development, technical consulting, and Mission Control.',
    url: 'https://ppventures.tech/services',
    type: 'website',
  },
};

const services = [
  {
    icon: '🤖',
    title: 'AI Agents + Integration',
    description: 'Custom AI agents tailored to your business needs with seamless integration to your existing tools.',
    features: [
      'Lead Generation Agents',
      'Customer Support Bots',
      'Sales Automation',
      'Data Analysis Agents',
      'API Integration',
      'Custom Webhooks',
      'Third-party Apps',
    ],
    price: 'Starting at ₹41,500',
  },
  {
    icon: '💡',
    title: 'Technical Consulting',
    description: 'Expert guidance on AI implementation, architecture design, and technology stack selection.',
    features: [
      'AI Strategy Sessions',
      'Architecture Review',
      'Tech Stack Selection',
      'Team Training',
      'MVP Development',
      'Go-to-Market Planning',
    ],
    price: 'Starting at ₹2,49,000',
  },
  {
    icon: '🎯',
    title: 'Mission Control',
    description: 'Your personal command center for autonomous operations. Manage AI agents, track tasks, monitor performance - all in one dashboard.',
    features: [
      '21 AI Agents Included',
      'Task Management',
      'Content Pipeline',
      'Calendar & Scheduling',
      'Analytics Dashboard',
      'Team Collaboration',
      'Workflow Automation',
    ],
    price: 'Starting at ₹16,500/mo',
    popular: true,
  },
];

export default function ServicesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="hero" style={{ minHeight: '50vh', paddingTop: '120px', position: 'relative', zIndex: 1 }}>
        <h1>
          Services &<br />
          <span>Products</span>
        </h1>
        <p>
          From AI agents to complete venture building.
          We help you build the autonomous company of tomorrow.
        </p>
      </div>

      <section style={{ paddingTop: '0', position: 'relative', zIndex: 1 }}>
        <div className="grid">
          {services.map((service, index) => (
            <div key={index} className="card" style={{ 
              border: service.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
              position: 'relative'
            }}>
              {service.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  POPULAR
                </div>
              )}
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                {service.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {service.description}
              </p>
              
              <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                {service.features.map((feature, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginTop: 'auto'
              }}>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 600,
                  color: 'var(--accent)'
                }}>
                  {service.price}
                </span>
                <Link href="/contact" className="btn btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <div className="newsletter" style={{ background: 'var(--accent)', color: '#fff' }}>
          <h3 style={{ color: '#fff' }}>Ready to Get Started?</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Book a free consultation call.
          </p>
          <Link href="/contact" className="btn" style={{ 
            marginTop: '24px', 
            display: 'inline-block',
            background: '#fff',
            color: 'var(--accent)'
          }}>
            Book Consultation
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
