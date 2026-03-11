import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | AI Automation for Founders',
  description: 'AI agent development, technical consulting, and automation suites. Custom agents built for your business, running 24/7.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
