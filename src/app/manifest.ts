import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'moncradle',
    short_name: 'moncradle',
    description: 'A premium digital platform for modern parents to track, nurture, and celebrate their baby\'s milestones.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  }
}
