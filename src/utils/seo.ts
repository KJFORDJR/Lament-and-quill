import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tiktokHandle?: string
  twitterHandle?: string
  instagramHandle?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = '/',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tiktokHandle = '@lament.and.quill', // Default TikTok handle
  twitterHandle = '@lamentandquill', // Default Twitter handle
  instagramHandle = '@lamentandquill', // Default Instagram handle
}: SEOProps): Metadata {
  const fullUrl = `https://lamentandquill.com${url}`
  const fullTitle = title.includes('Lament and Quill') ? title : `${title} | Lament and Quill`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [...keywords, 'lament and quill', 'dark fiction', 'tech noir'].join(', '),
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Lament and Quill',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: twitterHandle,
      site: twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  }

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
    }
  }

  return metadata
}

// Common metadata presets
export const SEOPresets = {
  dossier: (title?: string) => generateSEOMetadata({
    title: title || 'Dossier - Character & Location Archives',
    description: 'Explore detailed dossiers of characters and locations from Crimson City and Silver Heights.',
    keywords: ['dossier', 'characters', 'locations', 'archives'],
    url: '/dossier',
  }),
  
  crimsonLedger: (title?: string) => generateSEOMetadata({
    title: title || 'Crimson Ledger - Official Chronicles',
    description: 'Official journal entries from Crimson City, curated by administrators.',
    keywords: ['crimson ledger', 'chronicles', 'crimson city'],
    url: '/crimson-ledger',
  }),
  
  fragmentsOfLament: (title?: string) => generateSEOMetadata({
    title: title || 'Fragments of Lament - Silver Chronicles',
    description: 'Lament city\'s official chronicles, maintained by the silver administration.',
    keywords: ['fragments of lament', 'silver heights', 'chronicles'],
    url: '/fragments-of-lament',
  }),
  
  forum: (title?: string) => generateSEOMetadata({
    title: title || 'The Ledger and the Lament - Community Forum',
    description: 'Join discussions about the tales of two cities.',
    keywords: ['forum', 'community', 'discussion'],
    url: '/forum',
  }),
  
  merchandise: (title?: string) => generateSEOMetadata({
    title: title || 'Black Ledger Goods - Merchandise & Services',
    description: 'Explore exclusive merchandise and services from the world of Lament and Quill.',
    keywords: ['merchandise', 'shopping', 'black ledger goods'],
    url: '/merchandise',
  }),
}
