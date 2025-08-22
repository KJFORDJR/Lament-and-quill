import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Ledger and the Lament - Community Forum',
  description: 'Join discussions about the tales of two cities. Connect with fellow explorers, share theories, and delve deeper into the mysteries of Crimson City and Silver Heights.',
  keywords: ['forum', 'community', 'discussion', 'ledger and lament', 'crimson city', 'silver heights', 'theories', 'community'],
  openGraph: {
    title: 'The Ledger and the Lament - Community Forum | Lament and Quill',
    description: 'Join discussions about the tales of two cities. Connect with fellow explorers and share theories.',
    url: 'https://lamentandquill.com/forum',
  },
  alternates: {
    canonical: '/forum',
  },
}

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
