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

  function scrollTo(href: string) {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <span
          className="text-2xl font-display text-[var(--accent)] cursor-pointer"
          style={{fontFamily: 'var(--font-display)'}}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          HS
        </span>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className={`text-sm transition-colors hover:text-[var(--accent)] ${
                active === link.href.replace('#', '') ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button size="sm" onClick={() => scrollTo('#contact')}>Let&apos;s Connect</Button>
        </div>
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="p-2 text-[var(--text-muted)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className="md:hidden fixed inset-0 top-16 bg-[var(--bg)] z-50 flex flex-col items-center justify-center gap-8"
          >
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-3xl font-display text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                style={{fontFamily: 'var(--font-display)'}}
              >
                {link.label}
              </button>
            ))}
            <Button onClick={() => scrollTo('#contact')}>Let&apos;s Connect</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
