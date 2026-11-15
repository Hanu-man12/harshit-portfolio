'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { projects } from '@/data/projects';
import TiltCard from '@/components/ui/TiltCard';
import ProjectCard from './ProjectCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { staggerContainer, fadeUp } from '@/lib/motion';

export default function ProjectsSection() {
  const visible = projects.filter(p => p.visible);
  return (
    <section id="projects" className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="PROJECTS" subtitle="Selected work" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{once: true, margin: '-80px'}}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {visible.map(project => (
            <motion.div key={project.slug} variants={fadeUp}>
              <TiltCard>
                <ProjectCard project={project} />
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 text-center">
          <Link
            href="/projects"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
