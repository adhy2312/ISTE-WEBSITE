import type { Metadata } from 'next';
import { Inter, Playfair_Display, Orbitron } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import GeminiChat from './components/GeminiChat';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700', '900'] });

export const metadata: Metadata = {
  title: "ISTE MBCET Student's Chapter | KE065",
  description: "Empowering engineering students through innovation, technology, and excellence at Mar Baselios College of Engineering and Technology.",
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
        {!isStudio && <GeminiChat />}
      </body>
    </html>
  );
}
