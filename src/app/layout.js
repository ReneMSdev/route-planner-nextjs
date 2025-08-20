import './globals.css'

export const metadata = {
  title: 'Route Boss',
  description: 'Helpful tool for managing your routes',
  icons: '/favicon.png',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='h-full'>{children}</body>
    </html>
  )
}
