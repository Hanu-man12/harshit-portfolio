'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(stored || pref);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <button
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
