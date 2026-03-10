import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - PPVentures',
  description: 'Get in touch with us. We typically respond within 24 hours.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
