import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers | PPVentures',
  description: 'Join PPVentures - We are hiring AI engineers and more',
};

export default function Careers() {
  const jobs = [
    {
      title: 'AI Engineer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Build and deploy AI agents for client projects'
    },
    {
      title: 'Product Manager',
      type: 'Full-time',
      location: 'Remote',
      description: 'Define product roadmap for AI automation suite'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', padding: '120px 40px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Join Our Mission</h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '48px' }}>
          Help us build the autonomous future. We're hiring talented people.
        </p>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          {jobs.map((job, i) => (
            <div key={i} style={{ 
              background: '#1a1a1d', 
              border: '1px solid #27272a', 
              borderRadius: '12px', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{job.title}</h3>
              <p style={{ color: '#a1a1aa', marginBottom: '16px' }}>{job.description}</p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                <span>{job.type}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
            </div>
          ))}
        </div>
        
        <p style={{ marginTop: '48px', color: '#6b7280' }}>
          Don't see a role? Email us at <a href="mailto:careers@ppventures.tech" style={{ color: '#10b981' }}>careers@ppventures.tech</a>
        </p>
      </div>
    </div>
  );
}
