import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dossier - Character & Location Archives',
  description: 'Explore detailed dossiers of characters and locations from Crimson City and Silver Heights. Access classified information and discover the secrets that bind two cities.',
  keywords: ['dossier', 'characters', 'locations', 'crimson city', 'silver heights', 'archives', 'classified'],
  openGraph: {
    title: 'Dossier - Character & Location Archives | Lament and Quill',
    description: 'Explore detailed dossiers of characters and locations from Crimson City and Silver Heights.',
    url: 'https://lamentandquill.com/dossier',
  },
  alternates: {
    canonical: '/dossier',
  },
}

export default function DossierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
