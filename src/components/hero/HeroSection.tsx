'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { profile } from '@/data/profile';
import { assets } from '@/data/assets';
import { useMediaTier } from '@/lib/useMediaTier';
import { useReducedMotion } from '@/lib/useReducedMotion';
import Button from '@/components/ui/Button';
import HeroTerminal from './HeroTerminal';
import HeroStats from './HeroStats';

const PlanetScene = dynamic(() => import('@/components/three/PlanetScene'), { ssr: false });

const SECTION_DOTS = [
  { id: 'hero', label: '01' },
  { id: 'about', label: '02' },
  { id: 'experience', label: '03' },
  { id: 'projects', label: '04' },
  { id: 'contact', label: '05' },
];

export default function HeroSection() {
  const tier = useMediaTier();
  const reduced = useReducedMotion();
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  // Role cycling
  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % profile.roles.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Section dots observer
  useEffect(() => {
    const ids = SECTION_DOTS.map(d => d.id);
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Name scramble
  useEffect(() => {
    if (reduced || !nameRef.current) return;
    const finalText = 'HARSHIT SHAW';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%';
    let frame = 0;
    const total = 30;
    const el = nameRef.current;
    const anim = setInterval(() => {
      el.textContent = finalText.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (frame / total > i / finalText.length) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      frame++;
      if (frame > total) { el.textContent = finalText; clearInterval(anim); }
    }, 50);
    return () => clearInterval(anim);
  }, [reduced]);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="hero" className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-6 md:px-16 pt-24 md:pt-20 pb-10 md:pb-12 z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[var(--accent-dim)] bg-[var(--accent-dim)] rounded-full px-3 py-1 mb-6 w-fit">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs text-[var(--accent)] font-medium">AVAILABLE FOR INTERNSHIPS</span>
        </div>

        {/* Name */}
        <h1
          ref={nameRef}
          className="text-[clamp(3rem,12vw,8rem)] font-display leading-[0.9] text-[var(--text)] mb-4"
          style={{fontFamily: 'var(--font-display)'}}
        >
          HARSHIT SHAW
        </h1>

        {/* Role typewriter */}
        <div className="h-8 mb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={roleIdx}
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              transition={{duration: 0.3}}
              className="text-lg text-[var(--accent)]"
            >
              {profile.roles[roleIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tagline */}
        <p className="text-[var(--text-muted)] max-w-lg mb-8 leading-relaxed">{profile.tagline}</p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => scrollToSection('projects')}>View My Work</Button>
          <Button variant="outline" href={profile.resume} target="_blank" rel="noopener noreferrer">Download Resume</Button>
        </div>

        {/* Stats */}
        <HeroStats />

        {/* Terminal */}
        <div className="mt-10">
          <HeroTerminal />
        </div>
      </div>

      {/* Right side */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none md:relative md:inset-auto md:flex-1 md:opacity-100 md:pointer-events-auto">
        {tier === 'desktop' ? (
          <Suspense fallback={<div className="w-full h-full" />}>
            <div style={{width: '100%', height: '100%', minHeight: 500}}>
              <PlanetScene />
            </div>
          </Suspense>
        ) : (
          <Image
            src={assets.hero.heroBgMobile.src}
            alt={assets.hero.heroBgMobile.alt}
            width={assets.hero.heroBgMobile.width}
            height={assets.hero.heroBgMobile.height}
            className="object-cover w-full h-full"
            loading="eager"
          />
        )}
        {/* Astronaut */}
        <motion.div
          className="absolute bottom-10 right-10 z-10"
          animate={reduced ? {} : { y: [-10, 10, -10] }}
          transition={{duration: 4, repeat: Infinity, ease: 'easeInOut'}}
        >
          <Image
            src={assets.hero.astronaut.src}
            alt={assets.hero.astronaut.alt}
            width={assets.hero.astronaut.width}
            height={assets.hero.astronaut.height}
            className="w-36 sm:w-44 md:w-[min(30vw,400px)] h-auto"
            priority
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </motion.div>
      </div>

      {/* Section dots */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-20">
        {SECTION_DOTS.map(dot => (
          <button
            key={dot.id}
            onClick={() => scrollToSection(dot.id)}
            aria-label={`Scroll to section ${dot.label}`}
            className={`flex flex-col items-center gap-1 group`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeSection === dot.id ? 'bg-[var(--accent)] scale-125' : 'bg-[var(--border)]'
              }`}
            />
            <span className="text-[9px] font-mono text-[var(--text-muted)] group-hover:text-[var(--accent)]" style={{fontFamily: 'var(--font-mono)'}}>
              {dot.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
