import './globals.css'

export const metadata = {
  title: 'NERVE - PPVentures',
  description: 'Business Command Centre',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
