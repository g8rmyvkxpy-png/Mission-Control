'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Content {
  id: string;
  title: string;
  description: string;
  stage: string;
  platform: string;
  createdAt: string;
  scheduledAt: string;
  publishedAt: string;
  content: string;
}

export const dynamic = 'force-dynamic';

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setContents(data.content || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stages = ['idea', 'drafting', 'review', 'scheduled', 'published'];
  const platforms = ['twitter', 'linkedin', 'blog', 'youtube', 'newsletter'];

  const filtered = filter === 'all' ? contents : contents.filter(c => c.stage === filter);

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      idea: '#8b949e',
      drafting: '#d29922',
      review: '#a371f7',
      scheduled: '#2f81f7',
      published: '#3fb950'
    };
    return colors[stage] || '#8b949e';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: '𝕏',
      linkedin: 'in',
      blog: '📝',
      youtube: '▶️',
      newsletter: '📧'
    };
    return icons[platform] || '📄';
  };

  return (
    <div className="page">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/dashboard"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Content</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2f81f7,#a371f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12}}>D</div>
      </div>

      {/* Desktop Content */}
      <div className="desktop-content" style={{padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto'}}>
        {/* Desktop Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, margin: '0 0 8px'}}>Content 📝</h1>
            <p style={{color: '#8b949e', fontSize: 16, margin: 0}}>Manage your content pipeline</p>
          </div>
          <Link href="/dashboard" style={{color: '#8b949e', textDecoration: 'none'}}>← Back to Dashboard</Link>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24}}>
          {stages.map(stage => {
            const count = contents.filter(c => c.stage === stage).length;
            return (
              <div key={stage} className="card" style={{padding: 16, textAlign: 'center', cursor: 'pointer', border: filter === stage ? '2px solid #2f81f7' : '2px solid transparent'}} onClick={() => setFilter(filter === stage ? 'all' : stage)}>
                <span style={{fontSize: 12, color: getStageColor(stage), textTransform: 'capitalize'}}>{stage}</span>
                <p style={{fontSize: 24, fontWeight: 700, margin: '8px 0 0'}}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Content List */}
        {loading ? (
          <div className="card" style={{padding: 40, textAlign: 'center'}}>
            <p style={{color: '#8b949e'}}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{padding: 40, textAlign: 'center'}}>
            <p style={{color: '#8b949e'}}>No content found. {filter !== 'all' && <button onClick={() => setFilter('all')} style={{background: 'none', border: 'none', color: '#2f81f7', cursor: 'pointer'}}>Clear filter</button>}</p>
          </div>
        ) : (
          <div className="card" style={{padding: 24}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid #21262d'}}>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>TITLE</th>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>PLATFORM</th>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>STAGE</th>
                  <th style={{textAlign: 'left', padding: '12px 0', color: '#8b949e', fontSize: 12, fontWeight: 500}}>SCHEDULED</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} style={{borderBottom: i < filtered.length - 1 ? '1px solid #21262d' : 'none'}}>
                    <td style={{padding: '16px 0'}}>
                      <div style={{fontWeight: 500}}>{item.title}</div>
                      <div style={{fontSize: 12, color: '#8b949e', marginTop: 4}}>{item.description?.substring(0, 60)}...</div>
                    </td>
                    <td style={{padding: '16px 0'}}>
                      <span style={{fontSize: 16}}>{getPlatformIcon(item.platform)}</span>
                      <span style={{marginLeft: 8, color: '#8b949e', textTransform: 'capitalize'}}>{item.platform}</span>
                    </td>
                    <td style={{padding: '16px 0'}}>
                      <span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${getStageColor(item.stage)}20`, color: getStageColor(item.stage), textTransform: 'capitalize'}}>{item.stage}</span>
                    </td>
                    <td style={{padding: '16px 0', color: '#8b949e', fontSize: 14}}>
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav">
        <Link href="/dashboard" className="nav-link"><span style={{fontSize: 20}}>📊</span><span style={{fontSize: 10}}>Dashboard</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/content" className="nav-link active" style={{color: '#2f81f7'}}><span style={{fontSize: 20}}>📝</span><span style={{fontSize: 10}}>Content</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>More</span></Link>
      </div>
    </div>
  );
}
