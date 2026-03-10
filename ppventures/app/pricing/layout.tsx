import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - AI Automation Suite | PPVentures',
  description: 'Simple, transparent pricing for AI automation. Starter $297/mo, Growth $597/mo, Enterprise $997/mo. 14-day free trial.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
