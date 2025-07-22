import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { MaintenanceWrapper } from '@/components/MaintenanceWrapper'

export const metadata: Metadata = {
  title: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
  description: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gothic-black text-gothic-silver font-noir">
        <AuthProvider>
          <ModalProvider>
            <MaintenanceWrapper>
              <div className="tech-grid bg-tech-grid opacity-10 fixed inset-0 pointer-events-none" />
              <Navigation />
              <main className="relative z-10 min-h-screen">
                {children}
              </main>
              <Footer />
            </MaintenanceWrapper>
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
