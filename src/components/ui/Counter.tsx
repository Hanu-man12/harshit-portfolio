'use client';
import { useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, useInView } from 'motion/react';

export default function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => { if (inView) spring.set(target); }, [inView, spring, target]);

  return <motion.span ref={ref}>{display}</motion.span>;
}
