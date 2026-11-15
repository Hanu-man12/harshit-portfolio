'use client';
import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMediaTier } from '@/lib/useMediaTier';

export default function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const tier = useMediaTier();
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 300, damping: 25 });

  if (tier !== 'desktop') return <div className={className}>{children}</div>;

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-y * 15);
    rotY.set(x * 15);
  }

  function handleLeave() { rotX.set(0); rotY.set(0); }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 1000}}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
