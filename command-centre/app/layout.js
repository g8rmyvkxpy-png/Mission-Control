import './globals.css';

export const metadata = {
  title: 'Command Centre',
  description: 'AI Agent Command Centre',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
