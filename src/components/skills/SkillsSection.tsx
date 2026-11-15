'use client';
import { motion } from 'motion/react';
import { skillGroups } from '@/data/skills';
import Marquee from '@/components/ui/Marquee';
import SectionHeading from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

const allSkills = skillGroups.flatMap(g => g.skills);

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24">
      <div className="px-6 md:px-16 max-w-7xl mx-auto">
        <SectionHeading title="SKILLS" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{once: true}}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16"
        >
          {skillGroups.map(group => (
            <motion.div key={group.group} variants={fadeUp}>
              <h3 className="text-xs uppercase tracking-widest text-[var(--accent)] mb-3">{group.group}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map(skill => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      {/* Infinite marquee */}
      <div className="py-6 border-y border-[var(--border)]">
        <Marquee speed={30}>
          {allSkills.map(skill => (
            <span
              key={skill}
              className="text-sm font-mono px-4 py-1 text-[var(--text-muted)] shrink-0"
              style={{fontFamily: 'var(--font-mono)'}}
            >
              {skill}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
