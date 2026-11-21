import type { Metadata } from 'next';
import { Bebas_Neue, Inter, JetBrains_Mono, Orbitron } from 'next/font/google';
import './globals.css';
import LenisProvider from '@/components/ui/LenisProvider';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import PreLoader from '@/components/preloader/PreLoader';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const orbitron = Orbitron({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-display-orbitron',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Harshit Shaw — Backend Developer & Open-Source Contributor',
  description: 'Building scalable backend systems, working with PostgreSQL, and exploring real-world AI & cloud solutions.',
  openGraph: {
    title: 'Harshit Shaw — Backend Developer & Open-Source Contributor',
    description: 'Building scalable backend systems, working with PostgreSQL, and exploring real-world AI & cloud solutions.',
    images: [{ url: '/images/og/og-image.svg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bebasNeue.variable} ${orbitron.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        style={{fontFamily: 'var(--font-body)',}}
        className="bg-[var(--bg)] text-[var(--text)]"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded"
        >
          Skip to content
        </a>
        <LenisProvider>
          <PreLoader />
          <Nav />
          {children}
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
