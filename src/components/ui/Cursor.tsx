'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'motion/react';
import { useMediaTier } from '@/lib/useMediaTier';
import { useIsTouch } from '@/lib/useIsTouch';

export default function Cursor() {
  const tier = useMediaTier();
  const isTouch = useIsTouch();
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 600, damping: 32, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 600, damping: 32, mass: 0.4 });
  const size = useMotionValue(12);
  const hoveredRef = useRef(false);

  const isVisible = tier === 'desktop' && !isTouch;

  useEffect(() => {
    if (!isVisible) return;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const nowHovered = !!el.closest('a, button, [data-cursor-hover]');
      if (nowHovered !== hoveredRef.current) {
        hoveredRef.current = nowHovered;
        animate(size, nowHovered ? 40 : 12, { duration: 0.15, ease: 'easeOut' });
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [isVisible, rawX, rawY, size]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference"
      style={{
        x,
        y,
        width: size,
        height: size,
        translateX: '-50%',
        translateY: '-50%',
        background: 'var(--accent)',
        boxShadow: '0 0 10px var(--accent-glow)',
      }}
    />
  );
}
