'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags?: string[];
}

export const dynamic = 'force-dynamic';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts).catch(() => setPosts([]));
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                       p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !selectedTag || p.tags?.includes(selectedTag);
    return matchSearch && matchTag;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="hero" style={{ minHeight: '40vh', paddingTop: '120px' }}>
        <h1>Our <span style={{ color: '#f97316' }}>Blog</span></h1>
        <p style={{ color: '#a1a1aa' }}>Insights on AI, autonomous companies, and the future.</p>
        
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '12px 20px', background: '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', width: '280px' }}
          />
          <button onClick={() => setSelectedTag('')} style={{ padding: '12px 20px', background: selectedTag === '' ? '#f97316' : '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag)} style={{ padding: '12px 20px', background: selectedTag === tag ? '#f97316' : '#1a1a1d', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>{tag}</button>
          ))}
        </div>
      </div>

      <section style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading posts...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No posts found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {filtered.map(post => (
              <article key={post.slug} style={{ background: '#1a1a1d', borderRadius: '12px', padding: '32px', border: '1px solid #27272a' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{post.date}</div>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>{post.title}</h2>
                </Link>
                <p style={{ color: '#a1a1aa', marginBottom: '16px' }}>{post.excerpt}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {post.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '11px', padding: '4px 8px', background: '#27272a', borderRadius: '4px', color: '#a1a1aa' }}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
