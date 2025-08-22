import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crimson Ledger - Official Chronicles',
  description: 'Official journal entries from Crimson City, curated by administrators. Discover the dark secrets and chronicles of the crimson realm.',
  keywords: ['crimson ledger', 'chronicles', 'crimson city', 'official journal', 'dark fiction', 'admin curated'],
  openGraph: {
    title: 'Crimson Ledger - Official Chronicles | Lament and Quill',
    description: 'Official journal entries from Crimson City, curated by administrators.',
    url: 'https://lamentandquill.com/crimson-ledger',
  },
  alternates: {
    canonical: '/crimson-ledger',
  },
}

export default function CrimsonLedgerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
