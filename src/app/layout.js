import './globals.css'

export const metadata = {
  title: 'Route Boss',
  description: 'Helpful tool for managing your routes',
  // favicon.svg is the source; the PNGs are rendered from it
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: { url: '/apple-icon.png', sizes: '180x180' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='h-full'>{children}</body>
    </html>
  )
}
