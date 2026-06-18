import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ISTE MBCET | Indian Society for Technical Education',
    short_name: 'ISTE MBCET',
    description:
      'The official ISTE Student Chapter at Mar Baselios College of Engineering and Technology. Empowering engineering students through innovation and technology.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0c',
    theme_color: '#0a0a0c',
    orientation: 'portrait-primary',
    categories: ['education', 'technology', 'community'],
    icons: [
      {
        src: '/iste.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/iste.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/iste.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/iste.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
