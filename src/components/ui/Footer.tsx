import { GitFork, Link, Mail } from 'lucide-react';
import { profile } from '@/data/profile';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <p
          className="text-5xl md:text-7xl font-display text-[var(--text)] mb-8"
          style={{fontFamily: 'var(--font-display)'}}
        >
          HARSHIT SHAW
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex gap-4">
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <GitFork size={22} />
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <Link size={22} />
            </a>
            <a href={`mailto:${profile.links.email}`} aria-label="Email" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <Mail size={22} />
            </a>
          </div>
          <div className="text-[var(--text-muted)] text-sm">
            <p>Built with Next.js, Tailwind, Motion, GSAP</p>
            <p className="mt-1">&copy; 2025 Harshit Shaw</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
