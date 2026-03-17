import Navbar from './components/Navbar';
import Footer from './components/Footer';

const stories = [
  {
    name: "Rahul Mehta",
    company: "TechStart Consulting",
    result: "Lead response time: 4 hours → 2 minutes",
    revenue: "+$30K/quarter",
    quote: "Our lead response time dropped from 4 hours to 2 minutes. We've captured an estimated $30K in additional revenue this quarter alone.",
  },
  {
    name: "Priya Sharma",
    company: "GrowthLab Agency",
    result: "Saved 15 hours/week",
    revenue: "Reduced costs by 60%",
    quote: "The email automation alone saves our team 15 hours every week. What used to be manual follow-ups now happens on autopilot.",
  },
  {
    name: "Arjun Patel",
    company: "CloudNine Real Estate",
    result: "5x faster lead processing",
    revenue: "+$50K/month",
    quote: "We were skeptical about AI automation, but PPVentures delivered in 5 days what our internal team couldn't do in 2 months.",
  }
];

export default function SuccessStories() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navbar />
      <div style={{ padding: '120px 20px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', textAlign: 'center', marginBottom: '16px' }}>
          Success Stories
        </h1>
        <p style={{ fontSize: '20px', color: '#a1a1aa', textAlign: 'center', marginBottom: '60px' }}>
          Real results from real businesses
        </p>
        
        <div style={{ display: 'grid', gap: '32px' }}>
          {stories.map((story, i) => (
            <div key={i} style={{ background: '#1a1a1d', borderRadius: '24px', padding: '40px', border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <p style={{ fontSize: '20px', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '24px', color: '#e4e4e7' }}>
                    "{story.quote}"
                  </p>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '18px' }}>{story.name}</div>
                    <div style={{ color: '#10b981' }}>{story.company}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', minWidth: '200px' }}>
                  <div style={{ background: '#10b98120', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{story.result}</div>
                  </div>
                  <div style={{ background: '#3b82f620', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{story.revenue}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Ready to be our next success story?</h2>
          <a href="/ai-ops#contact" style={{ display: 'inline-block', padding: '16px 32px', background: '#10b981', color: '#fff', borderRadius: '12px', fontWeight: '700', fontSize: '18px', textDecoration: 'none' }}>
            Get Started →
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
