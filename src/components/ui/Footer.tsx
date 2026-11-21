'use client';

import { profile } from '@/data/profile';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left">
          <div className="min-w-0 md:flex-1">
            <p className="mb-3 font-display text-4xl text-[var(--text)] sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
              HARSHIT SHAW
            </p>
            <p className="text-sm font-medium leading-6 text-[var(--text)] sm:text-base">
              <span className="block">Karmanye vadhikaraste ma phaleshu kadachana.</span>
              <span className="mt-1 block text-[var(--text-muted)]">Ma karma-phala-hetur bhur ma te sango&apos;stv akarmani.</span>
            </p>
            <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--accent)]/80">
              Shrimad Bhagavad Gita – Adhyay 2, Shlok 47
            </p>
          </div>
          <div className="text-center text-sm text-[var(--text-muted)] md:shrink-0 md:text-right">
            <p>Built with Next.js, Tailwind, Motion, GSAP</p>
            <p className="mt-1">&copy; 2025 Harshit Shaw</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
