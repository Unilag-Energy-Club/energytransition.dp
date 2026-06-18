import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Energy Transition 360 — Get Your DP',
  description:
    'Personalize your profile picture for the UNILAG Energy Club Energy Transition 360 campaign. Upload your photo, enter your name, download your DP.',
  openGraph: {
    title: 'I Just Joined The Energy Transition — UNILAG Energy Club',
    description: 'Get your personalized Energy Transition 360 DP.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
