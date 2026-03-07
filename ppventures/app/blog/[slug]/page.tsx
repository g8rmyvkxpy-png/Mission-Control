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
    title: `${post.title} - PPVentures Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  const contentHtml = await markdownToHtml(post.content);
  
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b' }}>
      <Navbar />
      
      <article style={{ padding: '120px 40px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/blog" style={{ color: '#f97316', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>← Back to Blog</Link>
        
        <header style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{post.date}</div>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>{post.title}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            {post.tags?.map(tag => (
              <span key={tag} style={{ fontSize: '12px', padding: '4px 12px', background: '#27272a', borderRadius: '4px', color: '#a1a1aa' }}>{tag}</span>
            ))}
          </div>
        </header>
        
        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{ lineHeight: '1.8', color: '#d4d4d8' }}
        />
      </article>
      
      <Footer />
    </div>
  );
}
