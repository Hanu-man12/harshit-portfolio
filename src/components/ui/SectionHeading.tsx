'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export default function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0.2 },
      {
        opacity: 1,
        scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'top 40%', scrub: true },
      }
    );
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [reduced]);

  return (
    <div className="mb-12">
      <h2
        ref={ref}
        className="font-display text-6xl md:text-8xl text-[var(--text)] uppercase leading-none"
        style={{fontFamily: 'var(--font-display)'}}
      >
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-[var(--text-muted)] text-lg">{subtitle}</p>}
    </div>
  );
}
