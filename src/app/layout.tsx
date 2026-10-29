import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chordister - Musical Chord Pad & Song Manager',
  description: 'Interactive musical chord pad and song manager with acoustic guitar & piano sound synthesis. Built for Android, tablets, and PC.',
  applicationName: 'Chordister',
  appleWebApp: { capable: true, title: 'Chordister', statusBarStyle: 'black' },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Chordister - Musical Chord Pad & Song Manager',
    description: 'Play, customize, and share chord progressions with realistic acoustic guitar & grand piano sounds.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F1117',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-app text-text-primary antialiased min-h-screen flex flex-col selection:bg-accent-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
