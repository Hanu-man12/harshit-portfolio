'use client';
import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMediaTier } from '@/lib/useMediaTier';

export default function MagneticButton({ children }: { children: ReactNode }) {
  const tier = useMediaTier();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });

  if (tier !== 'desktop') return <>{children}</>;

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
      x.set(dx * 0.3);
      y.set(dy * 0.3);
    }
  }

  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.div ref={ref} style={{x, y}} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </motion.div>
  );
}
