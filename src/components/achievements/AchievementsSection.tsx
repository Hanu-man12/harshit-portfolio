'use client';
import Image from 'next/image';
import { motion } from 'motion/react';
import { achievements } from '@/data/achievements';
import SectionHeading from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

export default function AchievementsSection() {
  const visible = achievements.filter(a => a.visible);
  return (
    <section id="achievements" className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="ACHIEVEMENTS" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{once: true}}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {visible.map(a => (
            <motion.div
              key={a.id}
              variants={fadeUp}
              className="relative border border-[var(--border)] bg-[var(--surface)] p-6 rounded-sm overflow-hidden"
            >
              {/* HUD corner brackets */}
              <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent)]" />
              <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--accent)]" />
              <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--accent)]" />
              <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent)]" />
              <div className="relative h-40 mb-4 rounded-sm overflow-hidden">
                <Image src={a.image} alt={a.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <h3 className="text-xl font-display mb-1" style={{fontFamily: 'var(--font-display)'}}>{a.title}</h3>
              {a.subtitle && <p className="text-xs text-[var(--accent)] mb-3">{a.subtitle}</p>}
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{a.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
