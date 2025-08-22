// Social Media Links Configuration
export const SOCIAL_LINKS = {
  tiktok: {
    url: 'https://www.tiktok.com/@yourtiktokhandle', // Replace with your actual TikTok handle
    handle: '@yourtiktokhandle',
    name: 'TikTok',
  },
  twitter: {
    url: 'https://twitter.com/lamentandquill', // Replace with your actual Twitter handle
    handle: '@lamentandquill',
    name: 'Twitter/X',
  },
  instagram: {
    url: 'https://www.instagram.com/lamentandquill/',
    handle: '@lamentandquill',
    name: 'Instagram',
  },
  // Add more social media platforms as needed
  // youtube: {
  //   url: 'https://www.youtube.com/@lamentandquill',
  //   handle: '@lamentandquill',
  //   name: 'YouTube',
  // },
}

// SEO-related constants
export const SEO_CONFIG = {
  siteName: 'Lament and Quill',
  siteUrl: 'https://lamentandquill.com',
  defaultTitle: 'Lament and Quill - Two cities. Two Ghosts. One reckoning.',
  defaultDescription: 'A Dark Neo-Gothic Tech Noir experience featuring the tales of two cities bound by fate.',
  defaultImage: '/og-image.jpg',
  twitterHandle: SOCIAL_LINKS.twitter.handle,
  tiktokHandle: SOCIAL_LINKS.tiktok.handle,
  instagramHandle: SOCIAL_LINKS.instagram.handle,
}
