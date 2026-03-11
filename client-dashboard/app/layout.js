export const metadata = {
  title: 'PPVentures Dashboard',
  description: 'AI agents running your business 24/7',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
