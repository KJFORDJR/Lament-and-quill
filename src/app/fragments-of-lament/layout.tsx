import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fragments of Lament - Silver Chronicles',
  description: 'Lament city\'s official chronicles, maintained by the silver administration. Explore the ethereal tales and mysteries of Silver Heights.',
  keywords: ['fragments of lament', 'silver heights', 'chronicles', 'lament city', 'official journal', 'silver administration'],
  openGraph: {
    title: 'Fragments of Lament - Silver Chronicles | Lament and Quill',
    description: 'Lament city\'s official chronicles, maintained by the silver administration.',
    url: 'https://lamentandquill.com/fragments-of-lament',
  },
  alternates: {
    canonical: '/fragments-of-lament',
  },
}

export default function FragmentsOfLamentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
