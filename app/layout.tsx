import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TriLingua Lexicon AI',
  description: 'An intelligent trilingual dictionary (Japanese, English, Chinese)',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230ea5e9'/%3E%3Ctext x='50' y='50' font-family='serif' font-size='60' fill='white' text-anchor='middle' dominant-baseline='central'%3E文%3C/text%3E%3C/svg%3E"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="google-adsense-account" content="ca-pub-7660870709075118" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7660870709075118" crossOrigin="anonymous"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}