import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agents | PPVentures',
  description: 'Meet your AI team - Neo, Atlas, and Orbit. Autonomous agents that find leads, write outreach, and run your business 24/7.',
};

export default function AiAgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
