import type { Metadata } from 'next';
import { Inter, Playfair_Display, Orbitron } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700', '900'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://iste-mbcet.vercel.app'),
  title: {
    default: "ISTE MBCET Student's Chapter | KE065",
    template: "%s | ISTE MBCET"
  },
  description: "Empowering engineering students through innovation, technology, and excellence at Mar Baselios College of Engineering and Technology. Join India's premier technical community.",
  keywords: ["ISTE", "MBCET", "Engineering", "Technical Education", "Student Chapter", "Kerala", "Innovation", "Workshops", "Internships"],
  authors: [{ name: "ISTE MBCET Student's Chapter" }],
  creator: "ISTE MBCET",
  publisher: "ISTE MBCET",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://iste-mbcet.vercel.app",
    title: "ISTE MBCET Student's Chapter | KE065",
    description: "Empowering engineering students through innovation, technology, and excellence at MBCET.",
    siteName: "ISTE MBCET",
    images: [
      {
        url: "/iste.png",
        width: 1200,
        height: 630,
        alt: "ISTE MBCET Student's Chapter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISTE MBCET Student's Chapter | KE065",
    description: "Empowering engineering students through innovation, technology, and excellence at MBCET.",
    images: ["/iste.png"],
    creator: "@iste_mbcet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/iste.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('next-url') || '';
  const isStudio = pathname.startsWith('/studio');

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${orbitron.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}

      </body>
    </html>
  );
}
