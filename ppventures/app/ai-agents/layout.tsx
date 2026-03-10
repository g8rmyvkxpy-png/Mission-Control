import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agents - Neo, Atlas & Orbit | PPVentures',
  description: 'Meet Neo, Atlas, and Orbit — our real AI agents running 24/7. Task execution, lead generation, research, and more.',
};

export default function AiAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
