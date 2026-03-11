import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllPosts, getPostBySlug, markdownToHtml } from '../../../lib/markdown';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  
  return {
    title: `${post.title} | PPVentures Blog`,
    description: post.excerpt || undefined,
    openGraph: {
      title: `${post.title} | PPVentures Blog`,
      description: post.excerpt || undefined,
      type: 'article',
      publishedTime: post.date,
      authors: ['PPVentures Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | PPVentures Blog`,
      description: post.excerpt || undefined,
    },
  };
}

const categoryColors: Record<string, string> = {
  'ai-agents': '#f97316',
  'automation': '#8b5cf6',
  'building-in-public': '#10b981',
  'tutorials': '#06b6d4',
};

export default async function BlogPostPage({ params }: Props) {
  let post;
  let contentHtml = '';
  let slug = '';
  
  try {
    slug = (await params).slug;
    post = getPostBySlug(slug);
    
    if (!post) {
      notFound();
    }
    
    contentHtml = await markdownToHtml(post.content);
  } catch (error) {
    console.error('Blog post error:', error);
    notFound();
  }
  
  // Get all posts for related posts
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => p.slug !== slug && p.category && post.category && p.category === post.category)
    .slice(0, 2);

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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b' }}>
      <Navbar />
      
      <article style={{ padding: '120px 20px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/blog" style={{ color: '#10b981', textDecoration: 'none', display: 'inline-block', marginBottom: '32px', fontSize: '14px' }}>
          ← Back to Blog
        </Link>
        
        <header style={{ marginBottom: '40px' }}>
          {post.category && (
            <span style={{ 
              fontSize: '12px', 
              padding: '4px 12px', 
              background: categoryColors[post.category] || '#27272a', 
              borderRadius: '4px', 
              color: '#fff',
              fontWeight: '600',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '16px',
            }}>
              {post.category}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '700', marginBottom: '20px', lineHeight: 1.2 }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>PPVentures Team</span>
            <span>•</span>
            <span>{formatDate(post.date)}</span>
            <span>•</span>
            <span>{getReadTime(post.content)} min read</span>
          </div>
        </header>
        
        {/* Social Share */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #27272a' }}>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://ppventures.tech/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '8px 16px', background: '#1a1a1d', borderRadius: '6px', color: '#fff', fontSize: '13px', textDecoration: 'none' }}
          >
            Share on X
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=https://ppventures.tech/blog/${slug}&title=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '8px 16px', background: '#1a1a1d', borderRadius: '6px', color: '#fff', fontSize: '13px', textDecoration: 'none' }}
          >
            Share on LinkedIn
          </a>
          <span style={{ padding: '8px 16px', background: '#1a1a1d', borderRadius: '6px', color: '#6b7280', fontSize: '13px' }}>
            Copy link: ppventures.tech/blog/{slug}
          </span>
        </div>
        
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{ lineHeight: '1.8', color: '#d4d4d8', fontSize: '16px' }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #27272a' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ fontSize: '12px', padding: '6px 12px', background: '#27272a', borderRadius: '4px', color: '#a1a1aa' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section style={{ padding: '60px 20px', background: '#0d0d0f' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Related Posts</h3>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {relatedPosts.map(related => (
                <Link 
                  key={related.slug} 
                  href={`/blog/${related.slug}`}
                  style={{ 
                    background: '#1a1a1d', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    border: '1px solid #27272a',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
                    {related.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(related.date)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
}
