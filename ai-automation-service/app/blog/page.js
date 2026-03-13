export const metadata = {
  title: 'Blog - PPVentures',
  description: 'Insights on AI automation, autonomous agents, and growing your business with AI.'
}

export default function Blog() {
  const posts = [
    {
      slug: 'ai-agents-small-business',
      title: 'How AI Agents Are Replacing $100K/Year Admin Staff',
      excerpt: 'Smart businesses are now running 24/7 operations with AI agents that never sleep, never quit, and cost 90% less than a full-time employee.',
      date: 'March 13, 2026',
      readTime: '5 min read'
    },
    {
      slug: 'autonomous-companies',
      title: 'The Rise of the Fully Autonomous Company',
      excerpt: 'Companies with zero human employees are now generating real revenue. Here\'s how they work and what it means for your business.',
      date: 'March 10, 2026',
      readTime: '7 min read'
    },
    {
      slug: 'ai-vs-traditional-software',
      title: 'AI Agents vs Traditional Software: What\'s the Difference?',
      excerpt: 'Traditional automation follows rules. AI agents make decisions. Here\'s why that difference matters for your business growth.',
      date: 'March 8, 2026',
      readTime: '4 min read'
    }
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#fff',fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <header style={{padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #222',position:'sticky',top:0,background:'#0a0a0a',zIndex:100}}>
        <div style={{fontSize:'1.5rem',fontWeight:'bold'}}><span style={{color:'#10b981'}}>PP</span>Ventures</div>
        <nav style={{display:'flex',gap:'2rem',alignItems:'center'}}>
          <a href="/" style={{color:'#888',textDecoration:'none'}}>Home</a>
          <a href="/#pricing" style={{color:'#888',textDecoration:'none'}}>Pricing</a>
          <a href="/blog" style={{color:'#10b981',textDecoration:'none'}}>Blog</a>
          <a href="/#trial" style={{background:'#10b981',color:'#000',padding:'0.5rem 1.2rem',borderRadius:'6px',textDecoration:'none',fontWeight:600}}>Start Free Trial</a>
        </nav>
      </header>

      <section style={{padding:'4rem 2rem',maxWidth:'900px',margin:'0 auto'}}>
        <h1 style={{fontSize:'3rem',fontWeight:800,marginBottom:'1rem'}}>Blog</h1>
        <p style={{fontSize:'1.2rem',color:'#888',marginBottom:'3rem'}}>Insights on AI automation, autonomous agents, and growing your business.</p>
        
        <div style={{display:'grid',gap:'2rem'}}>
          {posts.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{display:'block',background:'#111',padding:'2rem',borderRadius:'12px',border:'1px solid #222',textDecoration:'none',color:'inherit',transition:'all 0.2s'}}>
              <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'1rem',fontSize:'0.9rem',color:'#666'}}>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 style={{fontSize:'1.5rem',marginBottom:'0.75rem',color:'#fff'}}>{post.title}</h2>
              <p style={{color:'#888',lineHeight:1.6,margin:0}}>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </section>

      <section style={{padding:'4rem 2rem',background:'#111',borderTop:'1px solid #222',textAlign:'center'}}>
        <h2 style={{fontSize:'2rem',marginBottom:'1rem'}}>Ready to automate your business?</h2>
        <p style={{color:'#888',marginBottom:'2rem'}}>Start your free 14-day trial today.</p>
        <a href="/#trial" style={{background:'#10b981',color:'#000',padding:'1rem 2rem',borderRadius:'8px',textDecoration:'none',fontWeight:600,display:'inline-block'}}>Start Free Trial →</a>
      </section>

      <footer style={{padding:'2rem',borderTop:'1px solid #222',textAlign:'center',color:'#666'}}>
        <p>© 2026 PPVentures. All rights reserved.</p>
      </footer>
    </div>
  )
}
