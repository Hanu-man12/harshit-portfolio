'use client';
import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experiences } from '@/data/experience';
import { useMediaTier } from '@/lib/useMediaTier';
import { useReducedMotion } from '@/lib/useReducedMotion';
import SectionHeading from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

function displayValue(val: string | null | undefined): string {
  if (!val || val === 'TODO_CONFIRM') return '—';
  return val;
}

const visibleExperiences = experiences.filter(e => e.visible);

export default function ExperienceSection() {
  const tier = useMediaTier();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tier !== 'desktop' || reduced || !sectionRef.current || !trackRef.current) return;
    const track = trackRef.current;
    const totalWidth = track.scrollWidth - window.innerWidth;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalWidth}`,
          scrub: true,
          pin: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [tier, reduced]);

  if (tier === 'desktop' && !reduced) {
    return (
      <section id="experience" ref={sectionRef} className="py-24 overflow-hidden">
        <div className="px-6 md:px-16 mb-12">
          <SectionHeading title="EXPERIENCE" />
        </div>
        <div ref={trackRef} className="flex gap-8 px-16" style={{width: 'max-content'}}>
          {visibleExperiences.map((exp) => (
            <div
              key={exp.id}
              className="w-[400px] shrink-0 border border-[var(--border)] bg-[var(--surface)] p-8 rounded-sm relative"
            >
              <span className="absolute top-8 left-0 w-2 h-2 rounded-full bg-[var(--accent)] -translate-x-1/2" />
              <p className="text-xs text-[var(--text-muted)] mb-2" style={{fontFamily: 'var(--font-mono)'}}>
                {displayValue(exp.startDate)} — {exp.endDate ? displayValue(exp.endDate) : 'Present'}
              </p>
              <h3 className="text-xl font-display mb-1" style={{fontFamily: 'var(--font-display)'}}>{exp.title}</h3>
              <p className="text-[var(--accent)] text-sm mb-4">{exp.company}</p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="EXPERIENCE" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{once: true}}
          variants={staggerContainer}
          className="relative pl-8 border-l border-[var(--border)] flex flex-col gap-10"
        >
          {visibleExperiences.map(exp => (
            <motion.div key={exp.id} variants={fadeUp} className="relative">
              <span className="absolute -left-10 top-2 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)]" />
              <p className="text-xs text-[var(--text-muted)] mb-2" style={{fontFamily: 'var(--font-mono)'}}>
                {displayValue(exp.startDate)} — {exp.endDate ? displayValue(exp.endDate) : 'Present'}
              </p>
              <h3 className="text-xl font-display mb-1" style={{fontFamily: 'var(--font-display)'}}>{exp.title}</h3>
              <p className="text-[var(--accent)] text-sm mb-3">{exp.company}</p>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{exp.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
