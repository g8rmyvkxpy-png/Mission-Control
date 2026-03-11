import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div style={{ 
        minHeight: '70vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '120px 20px 80px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ 
          fontSize: 'clamp(80px, 20vw, 150px)', 
          fontWeight: '800', 
          color: '#10b981',
          lineHeight: 1,
          marginBottom: '16px',
          opacity: 0.3,
        }}>
          404
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(24px, 4vw, 36px)', 
          fontWeight: '700', 
          color: '#fff',
          marginBottom: '16px',
        }}>
          Page Not Found
        </h1>
        
        <p style={{ 
          color: '#a1a1aa', 
          fontSize: '16px', 
          maxWidth: '400px',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link 
            href="/"
            style={{
              padding: '14px 28px',
              background: '#10b981',
              borderRadius: '10px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            Go Home
          </Link>
          <Link 
            href="/contact"
            style={{
              padding: '14px 28px',
              background: 'transparent',
              border: '2px solid #3f3f46',
              borderRadius: '10px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Contact Us
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
