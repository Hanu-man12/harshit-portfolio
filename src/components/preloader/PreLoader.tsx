'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function PreLoader() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const letters = 'HARSHIT SHAW'.split('');

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('preloader_shown')) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem('preloader_shown', '1');

    if (reduced) {
      setTimeout(() => setVisible(false), 500);
      return;
    }

    // Counter animation
    let n = 0;
    const interval = setInterval(() => {
      n += Math.floor(Math.random() * 15) + 5;
      if (n >= 100) { n = 100; clearInterval(interval); }
      setCount(n);
    }, 50);

    // Wait for 100 and document ready, then exit
    const checkDone = setInterval(() => {
      if (count >= 100 && document.readyState === 'complete') {
        clearInterval(checkDone);
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => setVisible(false),
          });
        } else {
          setVisible(false);
        }
      }
    }, 100);

    return () => { clearInterval(interval); clearInterval(checkDone); };
  }, []);

  // Trigger exit when count reaches 100
  useEffect(() => {
    if (count >= 100 && containerRef.current && !reduced) {
      const checkReady = setInterval(() => {
        if (document.readyState === 'complete') {
          clearInterval(checkReady);
          gsap.to(containerRef.current!, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => setVisible(false),
          });
        }
      }, 100);
      return () => clearInterval(checkReady);
    }
  }, [count, reduced]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{background: '#050505'}}
      >
        <div className="flex gap-1 md:gap-2 mb-8">
          {letters.map((char, i) => (
            <motion.span
              key={i}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: i * 0.05, duration: 0.4}}
              className="text-5xl md:text-9xl font-display text-[var(--accent)] inline-block"
              style={{fontFamily: 'var(--font-display)', color: '#e63946', whiteSpace: 'pre'}}
            >
              {char}
            </motion.span>
          ))}
        </div>
        <span
          className="text-2xl tabular-nums"
          style={{fontFamily: 'var(--font-mono)', color: '#888'}}
        >
          {count}%
        </span>
      </div>
    </AnimatePresence>
  );
}
