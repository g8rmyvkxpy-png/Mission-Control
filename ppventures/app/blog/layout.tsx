import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | PPVentures - AI & Automation Insights',
  description: 'Insights on AI agents, automation, and building autonomous businesses. Building in public - sharing what works.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
