import type { Metadata } from 'next';
import { Anton, Plus_Jakarta_Sans, Orbitron } from 'next/font/google';
import './globals.css';
import GeminiChat from './components/GeminiChat';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700', '900'] });

export const metadata: Metadata = {
  title: "ISTE MBCET Student's Chapter | KE065",
  description: "Empowering engineering students through innovation, technology, and excellence at Mar Baselios College of Engineering and Technology.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${anton.variable} ${orbitron.variable} font-jakarta`}>
        {children}
        <GeminiChat />
      </body>
    </html>
  );
}
