'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(stored || pref);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';

    // Capture click position for the radial reveal origin
    const rect = btnRef.current?.getBoundingClientRect();
    const cx = rect ? Math.round(rect.left + rect.width / 2) : window.innerWidth / 2;
    const cy = rect ? Math.round(rect.top + rect.height / 2) : window.innerHeight / 2;

    function applyTheme() {
      setTheme(next);
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
    }

    // View Transitions API — cinematic radial wipe
    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Pass the click coordinates as CSS custom properties on :root
      // so the @keyframes animation can use them
      document.documentElement.style.setProperty('--vt-cx', `${cx}px`);
      document.documentElement.style.setProperty('--vt-cy', `${cy}px`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).startViewTransition(applyTheme);
    } else {
      // Fallback: instant switch
      applyTheme();
    }
  }

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{rotate: -90, opacity: 0}}
          animate={{rotate: 0, opacity: 1}}
          exit={{rotate: 90, opacity: 0}}
          transition={{duration: 0.2}}
          className="block"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
