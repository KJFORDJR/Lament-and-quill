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
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
  description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <AdSenseScript />
      </head>
      <body className="min-h-screen bg-gothic-black text-gothic-silver font-noir">
        <AuthProvider>
          <ModalProvider>
            <MaintenanceWrapper>
              <div className="tech-grid bg-tech-grid opacity-10 fixed inset-0 pointer-events-none" />
              <Navigation />
              <AnnouncementTicker />
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
