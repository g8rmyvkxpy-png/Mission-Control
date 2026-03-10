import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - PPVentures',
  description: 'About PPVentures - We are a lean AI-first venture studio building autonomous systems that help businesses run smarter.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
