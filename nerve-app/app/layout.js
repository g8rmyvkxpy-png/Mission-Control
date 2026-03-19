import './globals.css'

export const metadata = {
  title: 'NERVE - PPVentures',
  description: 'Business Command Centre',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' stroke='%2322c55e' stroke-width='2' fill='none'/><circle cx='16' cy='10' r='3' fill='%2322c55e'/><circle cx='10' cy='20' r='3' fill='%2322c55e'/><circle cx='22' cy='20' r='3' fill='%2322c55e'/><circle cx='16' cy='16' r='2' fill='%2322c55e'/></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
