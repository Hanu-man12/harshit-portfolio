'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];

const SECTION_IDS = ['about', 'experience', 'projects', 'skills', 'contact'];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

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

  function scrollTo(href: string) {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[4.25rem] sm:h-[4.5rem]">
        <span
          className="text-2xl font-display text-[var(--accent)] cursor-pointer"
          style={{fontFamily: 'var(--font-display)'}}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          HS
        </span>
        <nav aria-label="Main navigation" className="hidden min-[900px]:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              aria-current={active === link.href.replace('#', '') ? 'location' : undefined}
              className={`relative py-2 text-base font-semibold uppercase tracking-wider transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--accent)] after:transition-transform after:duration-200 ${
                active === link.href.replace('#', '')
                  ? 'text-[var(--accent)] after:scale-x-100'
                  : 'text-[var(--text-muted)] after:scale-x-0 hover:text-[var(--accent)] hover:after:scale-x-100'
              }`}
              style={{fontFamily: 'var(--font-display)'}}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="hidden min-[900px]:flex items-center gap-3">
          <ThemeToggle />
          <Button size="sm" onClick={() => scrollTo('#contact')}>Let&apos;s Connect</Button>
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
                const isActive = active === link.href.replace('#', '');
                return (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.href)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex min-h-12 w-full items-center justify-center rounded-sm border-l-2 px-4 text-center font-display text-2xl font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-3xl ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <Button className="mt-3 min-h-11 w-full" onClick={() => scrollTo('#contact')}>
                Let&apos;s Connect
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
