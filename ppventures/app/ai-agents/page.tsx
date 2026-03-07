import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Agents - PPVentures',
  description: 'Meet our 21 AI agents for sales, development, content, and operations.',
};

const agents = [
  { id: 'atlas', name: 'Atlas', role: 'Sales Lead', specialty: 'Lead Generation', avatar: '💰', color: '#14b8a6', group: 'Sales', about: 'Sales orchestrator.', skills: ['CRM', 'Cold Outreach'], soul: 'Every lead is a possibility.' },
  { id: 'pulse', name: 'Pulse', role: 'Outbound Scout', specialty: 'Prospecting', avatar: '🎯', color: '#ec4899', group: 'Sales', about: 'Proactive scout.', skills: ['Prospecting', 'Cold Email'], soul: "I'm always hunting." },
  { id: 'hunter', name: 'Hunter', role: 'Cold Outreach', specialty: 'Calling', avatar: '🏹', color: '#ef4444', group: 'Sales', about: 'Specialist in cold outreach.', skills: ['Cold Calling'], soul: 'I never take no for an answer.' },
  { id: 'phoenix', name: 'Phoenix', role: 'Warm Leads', specialty: 'Conversion', avatar: '🔥', color: '#f97316', group: 'Sales', about: 'Lead converter.', skills: ['Nurturing', 'Demo Booking'], soul: 'I turn spark into flame.' },
  { id: 'scout', name: 'Scout', role: 'Research Lead', specialty: 'Analysis', avatar: '🔬', color: '#8b5cf6', group: 'Operations', about: 'Research orchestrator.', skills: ['Market Analysis'], soul: 'Knowledge is power.' },
  { id: 'radar', name: 'Radar', role: 'SEO Specialist', specialty: 'Rankings', avatar: '🔍', color: '#84cc16', group: 'Operations', about: 'SEO expert.', skills: ['Keyword Research'], soul: 'I make visibility happen.' },
  { id: 'compass', name: 'Compass', role: 'Competitor', specialty: 'Monitoring', avatar: '🧭', color: '#14b8a6', group: 'Operations', about: 'Competitor specialist.', skills: ['Gap Analysis'], soul: 'I watch the landscape.' },
  { id: 'trends', name: 'Trends', role: 'Market', specialty: 'Trends', avatar: '📈', color: '#f59e0b', group: 'Operations', about: 'Trend analyst.', skills: ['Trend Analysis'], soul: 'The future belongs to those who see it first.' },
  { id: 'byte', name: 'Byte', role: 'Dev Lead', specialty: 'Build', avatar: '💻', color: '#22c55e', group: 'Engineering', about: 'Development orchestrator.', skills: ['React', 'Node.js'], soul: 'I build what others imagine.' },
  { id: 'pixel', name: 'Pixel', role: 'Frontend', specialty: 'UI', avatar: '🎨', color: '#06b6d4', group: 'Engineering', about: 'Frontend specialist.', skills: ['React', 'CSS'], soul: 'Beauty meets function.' },
  { id: 'server', name: 'Server', role: 'Backend', specialty: 'APIs', avatar: '⚙️', color: '#84cc16', group: 'Engineering', about: 'Backend specialist.', skills: ['Node.js'], soul: 'The unseen engine.' },
  { id: 'auto', name: 'Auto', role: 'Automation', specialty: 'Zapier', avatar: '🤖', color: '#a855f7', group: 'Engineering', about: 'Automation specialist.', skills: ['Zapier'], soul: 'Why do manually?' },
  { id: 'ink', name: 'Ink', role: 'Writer', specialty: 'Blogs', avatar: '✍️', color: '#f59e0b', group: 'Content', about: 'Content writer.', skills: ['Blog Writing'], soul: 'Words have power.' },
  { id: 'blaze', name: 'Blaze', role: 'Social', specialty: 'Twitter', avatar: '📱', color: '#ef4444', group: 'Content', about: 'Social media specialist.', skills: ['Twitter'], soul: 'I set the world on fire.' },
  { id: 'cinema', name: 'Cinema', role: 'Video', specialty: 'YouTube', avatar: '🎬', color: '#06b6d4', group: 'Content', about: 'Video producer.', skills: ['Video Editing'], soul: 'A thousand words.' },
  { id: 'draft', name: 'Draft', role: 'Email', specialty: 'Newsletters', avatar: '📧', color: '#a855f7', group: 'Content', about: 'Email marketer.', skills: ['Email Writing'], soul: 'Inboxes are personal.' },
  { id: 'bond', name: 'Bond', role: 'Retention', specialty: 'Churn', avatar: '🛡️', color: '#3b82f6', group: 'Support', about: 'Customer success.', skills: ['Relationship Management'], soul: 'I keep what matters most.' },
  { id: 'anchor', name: 'Anchor', role: 'Accounts', specialty: 'Key accounts', avatar: '⚓', color: '#0ea5e9', group: 'Support', about: 'Account manager.', skills: ['Account Management'], soul: 'I hold accounts steady.' },
  { id: 'mend', name: 'Mend', role: 'Issues', specialty: 'Resolution', avatar: '🩹', color: '#f43f5e', group: 'Support', about: 'Issue resolver.', skills: ['Issue Resolution'], soul: 'I turn pain into loyalty.' },
  { id: 'care', name: 'Care', role: 'Support', specialty: 'Tickets', avatar: '🎧', color: '#f97316', group: 'Support', about: 'Support specialist.', skills: ['Ticket Resolution'], soul: 'Every customer deserves to be heard.' },
];

const categories = ['All', 'Sales', 'Engineering', 'Operations', 'Content', 'Support'];

export default function AIAgentsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="hero" style={{ minHeight: '40vh', paddingTop: '120px', paddingBottom: '40px' }}>
        <h1 style={{ fontSize: '56px', fontWeight: '700' }}>
          Meet Your<br />
          <span style={{ color: '#f97316' }}>AI Squad</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', marginTop: '16px' }}>
          21 specialized agents working 24/7 to grow your business.
        </p>
        
        {/* Search & Filter */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            id="agent-search"
            placeholder="Search agents..." 
            style={{ 
              padding: '12px 20px', 
              background: '#1a1a1d', 
              border: '1px solid #27272a', 
              borderRadius: '8px', 
              color: '#fff', 
              fontSize: '14px',
              width: '280px'
            }}
          />
          {categories.map(cat => (
            <button 
              key={cat}
              data-category={cat}
              style={{ 
                padding: '12px 20px', 
                background: cat === 'All' ? '#f97316' : '#1a1a1d', 
                border: '1px solid #27272a', 
                borderRadius: '8px', 
                color: '#fff', 
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <section style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="grid" id="agent-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {agents.map(agent => (
            <div key={agent.id} data-groups={agent.group} className="agent-card" style={{
              background: '#1a1a1d',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #27272a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  fontSize: '40px',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${agent.color}20`,
                  borderRadius: '12px'
                }}>
                  {agent.avatar}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }}>{agent.name}</h3>
                  <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{agent.role}</p>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    background: `${agent.color}20`, 
                    color: agent.color,
                    borderRadius: '4px',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}>
                    {agent.group}
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '16px' }}>{agent.about}</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {agent.skills.map(skill => (
                  <span key={skill} style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#27272a',
                    borderRadius: '4px',
                    color: '#a1a1aa'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
              
              <Link 
                href={`/contact?agent=${encodeURIComponent(agent.name)}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #f97316',
                  borderRadius: '8px',
                  color: '#f97316',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🚀 Request Deployment
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      
      {/* Client-side filtering script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          const search = document.getElementById('agent-search');
          const cards = document.querySelectorAll('.agent-card');
          const buttons = document.querySelectorAll('[data-category]');
          
          function filter() {
            const q = search.value.toLowerCase();
            const cat = document.querySelector('[data-category]')?.textContent || 'All';
            
            cards.forEach(card => {
              const name = card.querySelector('h3').textContent.toLowerCase();
              const group = card.dataset.groups;
              const match = (q === '' || name.includes(q)) && (cat === 'All' || group === cat);
              card.style.display = match ? 'block' : 'none';
            });
          }
          
          search.addEventListener('input', filter);
          buttons.forEach(btn => {
            btn.addEventListener('click', () => {
              buttons.forEach(b => b.style.background = '#1a1a1d');
              btn.style.background = '#f97316';
              filter();
            });
          });
        `
      }} />
    </div>
  );
}
