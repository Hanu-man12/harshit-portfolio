'use client';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { profile } from '@/data/profile';
import { assets } from '@/data/assets';
import { fadeUp, staggerContainer } from '@/lib/motion';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{once: true, margin: '-100px'}}
        variants={staggerContainer}
        className="grid md:grid-cols-2 gap-16 items-center"
      >
        {/* Left: photo */}
        <motion.div variants={fadeUp} className="relative w-full max-w-[400px] mx-auto md:mx-0">
          <div className="relative">
            {/* HUD corner brackets */}
            <span className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-[var(--accent)] z-10" />
            <span className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-[var(--accent)] z-10" />
            <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-[var(--accent)] z-10" />
            <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-[var(--accent)] z-10" />
            <Image
              src={assets.about.profile.src}
              alt={assets.about.profile.alt}
              width={400}
              height={500}
              className="w-full h-auto rounded-sm object-cover"
              style={{boxShadow: '0 0 40px var(--accent-glow)'}}
              sizes="(max-width: 768px) 90vw, 400px"
            />
          </div>
        </motion.div>

        {/* Right: bio */}
        <motion.div variants={staggerContainer} className="flex flex-col gap-6">
          <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-display" style={{fontFamily: 'var(--font-display)'}}>
            ABOUT ME
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[var(--text-muted)] leading-relaxed">
            {profile.tagline} I&apos;m currently pursuing a {profile.education.degree} at {profile.education.institution}, expected to graduate in {profile.education.expectedYear}. I enjoy building real-world tools, contributing to open source, and exploring the intersection of backend systems and AI.
          </motion.p>

          {/* Education card */}
          <motion.div variants={fadeUp} className="border border-[var(--border)] rounded-sm p-4 bg-[var(--surface)]">
            <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Education</p>
            <p className="text-[var(--text)] font-medium">{profile.education.degree} — {profile.education.institution}</p>
            <p className="text-sm text-[var(--text-muted)]">Expected {profile.education.expectedYear}</p>
          </motion.div>

          {/* Location */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <MapPin size={16} className="text-[var(--accent)]" />
            <span>{profile.location}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
