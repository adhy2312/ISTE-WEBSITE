import type { Metadata } from 'next';
import { Inter, Playfair_Display, Orbitron, Anton, Plus_Jakarta_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import BrainProvider from './brain/BrainProvider';
import dynamic from 'next/dynamic';
import PhysicsEngine from './brain/PhysicsEngine';
import NeuralNetwork from './brain/NeuralNetwork';
import MemoryEngine from './brain/MemoryEngine';

const IsteAssistant = dynamic(() => import('./components/IsteAssistant'));
const MagneticCursor = dynamic(() => import('./components/MagneticCursor'));
const DigitalSoul = dynamic(() => import('./components/DigitalSoul'));
const EngineObservatory = dynamic(() => import('./components/EngineObservatory'));
const PerformanceAmplifier = dynamic(() => import('./brain/PerformanceAmplifier'));
const SecurityGuardian = dynamic(() => import('./brain/SecurityGuardian'));
const PresenceEngine = dynamic(() => import('./brain/PresenceEngine'));
const PrefetchEngine = dynamic(() => import('./brain/PrefetchEngine'));
const ColorExtractionEngine = dynamic(() => import('./brain/ColorExtractionEngine'));
const InternshipEngine = dynamic(() => import('./brain/InternshipEngine'));

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-mono', weight: ['700', '900'], display: 'swap' });
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

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
    icon: "/iste.png",
    apple: "/iste.png",
  },
  verification: {
    google: "nXHbXTdgWRTlc3Q2BeBRp9mlojQVs7Eta8i8xNwM1dQ",
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
  const isAdmin = pathname.startsWith('/admin');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "ISTE MBCET Student's Chapter",
    url: 'https://iste-mbcet.vercel.app',
    logo: 'https://iste-mbcet.vercel.app/iste.png',
    description: "Empowering engineering students through innovation, technology, and excellence at Mar Baselios College of Engineering and Technology.",
    sameAs: [
      'https://www.instagram.com/iste_mbcet/',
      'https://www.linkedin.com/company/istescmbcet/'
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${orbitron.variable} ${anton.variable} ${jakarta.variable} font-sans`}
        suppressHydrationWarning
      >
        <BrainProvider>
          <PhysicsEngine />
          <NeuralNetwork />
          <MemoryEngine />
          <PerformanceAmplifier />
          <SecurityGuardian />
          <PrefetchEngine />
          <ColorExtractionEngine />
          <InternshipEngine />
          {!isStudio && <PresenceEngine />}
          {!isStudio && <DigitalSoul />}
          {children}
          {!isStudio && <IsteAssistant />}
          {!isStudio && <MagneticCursor />}
          {!isStudio && (process.env.NODE_ENV === 'development' || isAdmin) && <EngineObservatory />}
        </BrainProvider>
      </body>
    </html>
  );
}
