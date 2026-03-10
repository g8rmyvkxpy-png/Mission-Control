import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'PPVentures - AI Agents That Run Your Business 24/7',
  description: 'PPVentures deploys AI agents that handle your ops, find leads, book meetings and grow your business — completely autonomously. Start your free trial today.',
  keywords: 'AI agents, automation, autonomous business, AI startup, venture building, AI consulting',
  openGraph: {
    title: 'PPVentures - Your Business Runs 24/7',
    description: 'AI agents that handle your ops, find leads, book meetings — completely autonomously.',
    url: 'https://ppventures.tech',
    siteName: 'PPVentures',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PPVentures - AI Agents That Run Your Business 24/7',
    description: 'Let AI agents handle your ops, find leads, and grow your business autonomously.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "PPVentures",
                "url": "https://ppventures.tech",
                "description": "AI agents that run your business 24/7",
                "sameAs": [
                  "https://linkedin.com/company/ppventures",
                  "https://x.com/ppventures"
                ]
              })
            }}
          />
          {/* Google Analytics placeholder */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `
          }} />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
