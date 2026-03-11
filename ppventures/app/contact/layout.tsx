import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | PPVentures',
  description: 'Get in touch for AI automation, agent development, or consulting. We typically respond within 24 hours.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
