'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

const products = [
  {
    icon: '⚡',
    name: 'Automation Starter Pack',
    desc: 'Everything you need to start automating. Instant download.',
    price: '₹2,999',
    href: '/starter-pack',
    coming: false,
    highlight: true,
  },
  {
    icon: '📧',
    name: 'Email Automation Suite',
    desc: 'Smart email routing, auto-responses, and follow-up sequences. Your inbox on autopilot.',
    price: 'From ₹16K',
    href: '/email-automation',
    coming: false,
  },
  {
    icon: '📊',
    name: 'Report Automation',
    desc: 'Connect your data sources, generate reports automatically on schedule.',
    price: 'From ₹12K',
    href: '/report-automation',
    coming: false,
  },
  {
    icon: '🔗',
    name: 'Lead Follow-up System',
    desc: 'Nurture leads automatically from form submission to close.',
    price: 'From ₹29,000',
    href: '#',
    coming: true,
  },
  {
    icon: '🤖',
    name: 'AI Workflow Builder',
    desc: 'Visual workflow builder with AI integration.',
    price: '₹42,000',
    href: '#',
    coming: true,
  },
];

export default function ProductsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ padding: '140px 20px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          fontSize: 'clamp(32px, 6vw, 56px)', 
          fontWeight: '800', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Our Products
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: 'clamp(16px, 2vw, 20px)', 
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          Ready-to-use automation products. No custom development needed.
        </p>
      </div>

      {/* Products Grid */}
      <div style={{ padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {products.map((product, i) => (
              <Link 
                key={i} 
                href={product.href}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '32px',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.3s',
                  opacity: product.coming ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ fontSize: '48px' }}>{product.icon}</div>
                  {product.coming && (
                    <span style={{
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#a1a1aa',
                    }}>
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
                  {product.name}
                </h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {product.desc}
                </p>
                <div style={{ 
                  padding: '10px 20px',
                  background: product.coming ? 'rgba(255,255,255,0.05)' : '#10b981',
                  borderRadius: '10px',
                  display: 'inline-block',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: product.coming ? '#a1a1aa' : '#fff',
                }}>
                  {product.price}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
