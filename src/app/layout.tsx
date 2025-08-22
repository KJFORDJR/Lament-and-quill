import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { MaintenanceWrapper } from '@/components/MaintenanceWrapper'
import { SessionWarning } from '@/components/SessionWarning'
import AdSenseScript from '../components/AdSenseScript'
import AnnouncementTicker from '@/components/AnnouncementTicker'
import PollBanner from '@/components/PollBanner'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL('https://lamentandquill.com'),
  title: {
    default: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
    template: '%s | Lament and Quill'
  },
  description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate. Explore character dossiers, city chronicles, and join our community forum.',
  keywords: [
    'dark fiction',
    'cyberpunk',
    'gothic',
    'tech noir',
    'interactive story',
    'forum',
    'community',
    'crimson city',
    'silver heights',
    'dossier',
    'chronicles'
  ],
  authors: [{ name: 'Lament and Quill', url: 'https://lamentandquill.com' }],
  creator: 'Lament and Quill',
  publisher: 'Lament and Quill',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lamentandquill.com',
    siteName: 'Lament and Quill',
    title: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
    description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lament and Quill - Two cities converge in darkness',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
    description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
    images: ['/og-image.jpg'],
    creator: '@lamentandquill', // Update with your actual Twitter handle
    site: '@lamentandquill', // Update with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lament and Quill',
    alternateName: 'Lament & Quill',
    description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
    url: 'https://lamentandquill.com',
    sameAs: [
      'https://www.tiktok.com/@yourtiktokhandle', // Replace with your actual TikTok handle
      'https://www.instagram.com/lamentandquill/',
      // Add other social media links here as needed
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://lamentandquill.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'Lament and Quill',
      url: 'https://lamentandquill.com',
      logo: 'https://lamentandquill.com/og-image.jpg',
      description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
    },
  }

  return (
    <html lang="en">
      <head>
        <AdSenseScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gothic-black text-gothic-silver font-noir">
        <AuthProvider>
          <ModalProvider>
            <MaintenanceWrapper>
              <div className="tech-grid bg-tech-grid opacity-10 fixed inset-0 pointer-events-none" />
              <Navigation />
              <AnnouncementTicker />
              <PollBanner />
              <main className="relative z-10 min-h-screen">
                {children}
              </main>
              <Footer />
              <SessionWarning />
            </MaintenanceWrapper>
          </ModalProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
