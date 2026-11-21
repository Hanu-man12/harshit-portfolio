'use client';

import { GitFork, Link, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { profile } from '@/data/profile';

export default function Footer() {
  const pathname = usePathname();
  const isContactPage = pathname === '/contact';

  return (
    <footer className="border-t border-[var(--border)] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {isContactPage ? (
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left">
            <div className="min-w-0 md:flex-1">
              <p className="mb-3 font-display text-4xl text-[var(--text)] sm:text-5xl md:text-6xl" style={{fontFamily: 'var(--font-display)'}}>
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
        ) : (
          <>
            <p className="mb-8 text-5xl font-display text-[var(--text)] md:text-7xl" style={{fontFamily: 'var(--font-display)'}}>
              HARSHIT SHAW
            </p>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"><GitFork size={22} /></a>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"><Link size={22} /></a>
                <a href={`mailto:${profile.links.email}`} aria-label="Email" className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"><Mail size={22} /></a>
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                <p>Built with Next.js, Tailwind, Motion, GSAP</p>
                <p className="mt-1">&copy; 2025 Harshit Shaw</p>
              </div>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
