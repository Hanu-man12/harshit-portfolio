'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMediaTier } from '@/lib/useMediaTier';

export default function Cursor() {
  const tier = useMediaTier();
  const [hovered, setHovered] = useState(false);
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 500, damping: 28 });
  const y = useSpring(rawY, { stiffness: 500, damping: 28 });

  useEffect(() => {
    if (tier !== 'desktop') return;
    const move = (e: MouseEvent) => { rawX.set(e.clientX); rawY.set(e.clientY); };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(!!el.closest('a, button, [data-cursor-hover]'));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); };
  }, [tier, rawX, rawY]);

  if (tier !== 'desktop') return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference"
      style={{x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        width: hovered ? 40 : 12,
        height: hovered ? 40 : 12,
        background: 'var(--accent)',
        boxShadow: '0 0 10px var(--accent-glow)',
        transition: 'width 0.2s, height 0.2s',}}
    />
  );
}
