'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  category?: string;
}

export const dynamic = 'force-dynamic';

const categories = [
  { id: '', label: 'All' },
  { id: 'ai-agents', label: 'AI Agents' },
  { id: 'automation', label: 'Automation' },
  { id: 'building-in-public', label: 'Building in Public' },
  { id: 'tutorials', label: 'Tutorials' },
];

const categoryColors: Record<string, string> = {
  'ai-agents': '#f97316',
  'automation': '#8b5cf6',
  'building-in-public': '#10b981',
  'tutorials': '#06b6d4',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Featured post (first one)
  const featuredPost = filtered[0];
  const otherPosts = filtered.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero */}
      <div style={{ minHeight: '40vh', paddingTop: '140px', paddingBottom: '40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '700', marginBottom: '12px' }}>
          Our <span style={{ color: '#10b981' }}>Blog</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 'clamp(14px, 2vw, 18px)', maxWidth: '500px', margin: '0 auto' }}>
          Building in public. Sharing what works. Honest insights on AI, automation, and autonomous businesses.
        </p>
        
        {/* Search */}
        <div style={{ marginTop: '32px' }}>
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: '12px 20px', 
              background: '#1a1a1d', 
              border: '1px solid #27272a', 
              borderRadius: '8px', 
              color: '#fff', 
              width: '300px',
              maxWidth: '90vw',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ padding: '0 20px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ 
                padding: '10px 20px', 
                background: selectedCategory === cat.id ? '#10b981' : '#1a1a1d', 
                border: '1px solid #27272a', 
                borderRadius: '8px', 
                color: '#fff', 
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section style={{ padding: '0 20px 80px', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '16px' }}>
              First posts coming soon — we are building in public.
            </p>
            <p style={{ color: '#52525b', fontSize: '14px' }}>
              Check back in a few days.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No posts found in this category.</p>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ 
                  background: 'linear-gradient(135deg, #1a1a1d 0%, #0f1512 100%)', 
                  borderRadius: '20px', 
                  padding: '40px', 
                  border: '1px solid #10b98140',
                  marginBottom: '40px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {featuredPost.category && (
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 10px', 
                      background: categoryColors[featuredPost.category] || '#27272a', 
                      borderRadius: '4px', 
                      color: '#fff',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}>
                      {featuredPost.category}
                    </span>
                  )}
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '700', color: '#fff', marginTop: '16px', marginBottom: '12px' }}>
                    {featuredPost.title}
                  </h2>
                  <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: 1.6, marginBottom: '20px' }}>
                    {featuredPost.excerpt}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                    <span>PPVentures</span>
                    <span>•</span>
                    <span>{formatDate(featuredPost.date)}</span>
                    <span>•</span>
                    <span>{getReadTime(featuredPost.content)} min read</span>
                  </div>
                </article>
              </Link>
            )}

            {/* Other Posts Grid */}
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {otherPosts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <article style={{ 
                    background: '#1a1a1d', 
                    borderRadius: '16px', 
                    padding: '28px', 
                    border: '1px solid #27272a',
                    height: '100%',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#27272a';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    {post.category && (
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '3px 8px', 
                        background: categoryColors[post.category] || '#27272a', 
                        borderRadius: '4px', 
                        color: '#fff',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}>
                        {post.category}
                      </span>
                    )}
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginTop: '12px', marginBottom: '8px', lineHeight: 1.4 }}>
                      {post.title}
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(post.date)}</span>
                      <span style={{ fontSize: '13px', color: '#10b981' }}>Read more →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
