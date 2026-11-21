'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Achievements', href: '/certificates' },
  { label: 'Open Source', href: '/open-source' },
  { label: 'Contact', href: '/contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[4.25rem] sm:h-[4.5rem]">
        <Link href="/" aria-label="Harshit Shaw home" className="text-2xl font-display text-[var(--accent)]" style={{fontFamily: 'var(--font-display)'}} onClick={() => setOpen(false)}>
          HS
        </Link>
        <nav aria-label="Main navigation" className="hidden min-[900px]:flex items-center gap-3 lg:gap-4 xl:gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`relative whitespace-nowrap py-2 text-base font-semibold uppercase tracking-wider transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--accent)] after:transition-transform after:duration-200 ${
                isActive(link.href)
                  ? 'text-[var(--accent)] after:scale-x-100'
                  : 'text-[var(--text-muted)] after:scale-x-0 hover:text-[var(--accent)] hover:after:scale-x-100'
              }`}
              style={{fontFamily: 'var(--font-display)'}}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden min-[900px]:flex items-center gap-3">
          <ThemeToggle />
          <Button href="/contact" size="sm">Let&apos;s Connect</Button>
        </div>
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.18, ease: 'easeOut'}}
            className="absolute left-0 right-0 top-full z-50 min-h-[calc(100dvh-4.25rem)] max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:min-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-4.5rem)] min-[900px]:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 sm:py-5">
              {NAV_LINKS.map(link => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 w-full items-center justify-center rounded-sm border-l-2 px-4 text-center font-display text-2xl font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-3xl ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Button href="/contact" className="mt-3 min-h-11 w-full" onClick={() => setOpen(false)}>
                Let&apos;s Connect
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
