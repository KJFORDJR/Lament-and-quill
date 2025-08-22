import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Black Ledger Goods - Merchandise & Services',
  description: 'Explore exclusive merchandise and services from the world of Lament and Quill. Find unique items inspired by Crimson City and Silver Heights.',
  keywords: ['merchandise', 'black ledger goods', 'shopping', 'exclusive items', 'crimson city', 'silver heights', 'collectibles'],
  openGraph: {
    title: 'Black Ledger Goods - Merchandise & Services | Lament and Quill',
    description: 'Explore exclusive merchandise and services from the world of Lament and Quill.',
    url: 'https://lamentandquill.com/merchandise',
  },
  alternates: {
    canonical: '/merchandise',
  },
}

export default function MerchandiseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
