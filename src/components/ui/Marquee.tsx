'use client';
import { ReactNode } from 'react';
import { motion } from 'motion/react';

export default function Marquee({ children, speed = 40 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden flex">
      <motion.div
        className="flex gap-6 shrink-0"
        animate={{x: ['0%', '-50%']}}
        transition={{duration: speed, ease: 'linear', repeat: Infinity}}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
