'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { usePageTransition, getTransitionType } from '@/components/transitions/TransitionContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Achievements', href: '/certificates' },
  { label: 'Open Source', href: '/open-source' },
  { label: 'Contact', href: '/contact' },
];

// Visual clone of Button primary sm — avoids prop-type conflicts with the shared Button component
const connectBtnClass =
  'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] px-3 py-1.5 text-sm bg-[var(--accent)] text-white hover:opacity-90';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { navigateTo } = usePageTransition();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handleResize() {
      if (window.innerWidth >= 900) setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const type = getTransitionType(href);
    if (type) {
      e.preventDefault();
      setOpen(false);
      navigateTo(href, type);
    } else {
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[4.25rem] sm:h-[4.5rem]">
        <a
          href="/"
          aria-label="Harshit Shaw home"
          className="text-2xl font-display text-[var(--accent)]"
          style={{ fontFamily: 'var(--font-display)' }}
          onClick={(e) => handleNavClick(e, '/')}
        >
          HS
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden min-[900px]:flex items-center gap-3 lg:gap-4 xl:gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`relative whitespace-nowrap py-2 text-base font-semibold uppercase tracking-wider transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--accent)] after:transition-transform after:duration-200 cursor-pointer ${
                isActive(link.href)
                  ? 'text-[var(--accent)] after:scale-x-100'
                  : 'text-[var(--text-muted)] after:scale-x-0 hover:text-[var(--accent)] hover:after:scale-x-100'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden min-[900px]:flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/contact"
            onClick={(e) => handleNavClick(e, '/contact')}
            className={connectBtnClass}
          >
            Let&apos;s Connect
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex min-[900px]:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 min-h-[calc(100dvh-4.25rem)] max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:min-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-4.5rem)] min-[900px]:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 sm:py-5">
              {NAV_LINKS.map(link => {
                const active = isActive(link.href);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 w-full items-center justify-center rounded-sm border-l-2 px-4 text-center font-display text-2xl font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-3xl cursor-pointer ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/contact"
                onClick={(e) => handleNavClick(e, '/contact')}
                className={`mt-3 min-h-11 w-full ${connectBtnClass}`}
              >
                Let&apos;s Connect
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
