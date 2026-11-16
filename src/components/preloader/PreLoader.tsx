'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// ─── Segmented HUD Ring ──────────────────────────────────────────────────────

const TOTAL_SEGMENTS = 72;
const GAP_DEG = 2.2;
const RADIUS = 48; // % of SVG viewBox (100x100)
const CX = 50;
const CY = 50;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(index: number, total: number, r: number, cx: number, cy: number, gap: number) {
  const segDeg = 360 / total;
  const startDeg = index * segDeg + gap / 2;
  const endDeg = startDeg + segDeg - gap;
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = segDeg - gap > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function SegmentedRing({ progress }: { progress: number }) {
  const lit = Math.round((progress / 100) * TOTAL_SEGMENTS);
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="hud-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hud-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dim segments */}
      {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
        <path
          key={`dim-${i}`}
          d={segmentPath(i, TOTAL_SEGMENTS, RADIUS, CX, CY, GAP_DEG)}
          stroke={i < lit ? 'transparent' : 'rgba(180,20,40,0.22)'}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {/* Lit segments */}
      {Array.from({ length: lit }).map((_, i) => {
        const isLast = i === lit - 1;
        return (
          <path
            key={`lit-${i}`}
            d={segmentPath(i, TOTAL_SEGMENTS, RADIUS, CX, CY, GAP_DEG)}
            stroke={isLast ? '#ff4060' : '#e63946'}
            strokeWidth={isLast ? '2.8' : '2.2'}
            fill="none"
            strokeLinecap="round"
            filter={isLast ? 'url(#hud-glow-strong)' : i > lit - 5 ? 'url(#hud-glow)' : undefined}
            opacity={isLast ? 1 : 0.85 + (i / lit) * 0.15}
          />
        );
      })}
    </svg>
  );
}

// ─── Checkmark ───────────────────────────────────────────────────────────────

function Checkmark({ visible }: { visible: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!visible || !pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    gsap.fromTo(
      pathRef.current,
      { strokeDasharray: len, strokeDashoffset: len, opacity: 1 },
      { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' },
    );
  }, [visible]);

  if (!visible) return null;

  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-[0_0_10px_#e63946]" fill="none">
      <path
        ref={pathRef}
        d="M4 13l5 5L20 7"
        stroke="#e63946"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
      />
    </svg>
  );
}

// ─── Main PreLoader ───────────────────────────────────────────────────────────

export default function PreLoader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [showReady, setShowReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  // Track page readiness
  useEffect(() => {
    if (document.readyState === 'complete') {
      setPageReady(true);
    } else {
      window.addEventListener('load', () => setPageReady(true), { once: true });
    }
    // Safety timeout
    const t = setTimeout(() => setPageReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Smooth progress: 1→100 in ~3 seconds (30ms per tick)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(1);

  const startProgress = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;

      // Hold at 99 until page is ready
      if (progressRef.current >= 99 && !pageReady) {
        progressRef.current = 99;
        setProgress(99);
        return;
      }

      if (progressRef.current >= 100) {
        progressRef.current = 100;
        setProgress(100);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setAnimDone(true);
        return;
      }

      setProgress(progressRef.current);
    }, 30);
  }, [pageReady]);

  // Start progress after initial reveal animation (0.6s delay)
  useEffect(() => {
    if (reduced) { setVisible(false); return; }
    const t = setTimeout(startProgress, 600);
    return () => clearTimeout(t);
  }, [reduced, startProgress]);

  // Once held at 99 and page becomes ready, resume to 100
  useEffect(() => {
    if (!pageReady || animDone) return;
    if (progressRef.current >= 99 && !intervalRef.current) {
      startProgress();
    }
  }, [pageReady, animDone, startProgress]);

  // On animDone: show SYSTEM READY, then exit
  useEffect(() => {
    if (!animDone) return;
    const t1 = setTimeout(() => setShowReady(true), 300);
    const t2 = setTimeout(() => {
      if (!containerRef.current) { setVisible(false); return; }
      gsap.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => setVisible(false),
      });
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animDone]);

  // Entrance animation
  useEffect(() => {
    if (reduced || !visible) return;
    const ctx = gsap.context(() => {
      gsap.set([headingRef.current, subtitleRef.current, hudRef.current], {
        autoAlpha: 0, y: 18,
      });
      gsap.timeline()
        .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.25)
        .to(hudRef.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.4);
    }, containerRef);
    return () => ctx.revert();
  }, [reduced, visible]);

  if (!visible) return null;

  // Reduced motion: instant fade
  if (reduced) return null;

  return (
    <div
      ref={containerRef}
      className="preloader-root fixed inset-0 z-[9999] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/preloader/harshit-shaw-preloader-bg.png"
          alt=""
          fill
          priority
          unoptimized
          draggable={false}
          className="preloader-bg-img"
          sizes="100vw"
        />
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Bottom gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Subtle red nebula atmosphere */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 65% 42%, rgba(200,20,45,0.13) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 30% 60%, rgba(150,10,30,0.10) 0%, transparent 45%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-10 px-6 md:py-14">

        {/* Top: Heading + Subtitle */}
        <div className="flex flex-col items-center text-center mt-2 md:mt-4">
          <h1
            ref={headingRef}
            className="preloader-heading font-display leading-none tracking-widest text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 7vw, 6.5rem)',
              textShadow:
                '0 0 20px rgba(230,57,70,0.6), 0 0 60px rgba(230,57,70,0.25), 0 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: '#f4f1f2' }}>HARSHIT </span>
            <span style={{ color: '#e63946' }}>SHAW</span>
          </h1>
          <p
            ref={subtitleRef}
            className="mt-3 text-[0.65rem] md:text-xs tracking-[0.3em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'rgba(244,241,242,0.7)',
              letterSpacing: '0.3em',
            }}
          >
            {showReady ? 'SYSTEM READY' : 'INITIALIZING PORTFOLIO'}
          </p>
        </div>

        {/* Middle: HUD Ring */}
        <div
          ref={hudRef}
          className="relative flex items-center justify-center preloader-hud"
          style={{ width: 'clamp(180px, 36vw, 280px)', aspectRatio: '1' }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: `0 0 ${progress > 50 ? 32 : 16}px rgba(230,57,70,${0.1 + (progress / 100) * 0.25})`,
              transition: 'box-shadow 0.3s ease',
            }}
          />

          {/* Segmented SVG ring */}
          <div className="absolute inset-0">
            <SegmentedRing progress={progress} />
          </div>

          {/* Centre: percentage or checkmark */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {showReady ? (
              <Checkmark visible={showReady} />
            ) : (
              <span
                className="tabular-nums leading-none"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                  color: '#f4f1f2',
                  textShadow: '0 0 12px rgba(230,57,70,0.4)',
                }}
                aria-label={`${progress} percent loaded`}
              >
                {progress}
                <span style={{ fontSize: '0.5em', color: 'rgba(244,241,242,0.6)', marginLeft: 1 }}>%</span>
              </span>
            )}
          </div>

          {/* HUD corner tick marks */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute pointer-events-none"
              style={{
                width: 8,
                height: 8,
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(${(parseFloat('clamp(180px,36vw,280px)') / 2) + 10}px) translateY(-50%)`,
              }}
            >
              <div
                style={{
                  width: 2,
                  height: 8,
                  background: 'rgba(230,57,70,0.6)',
                  borderRadius: 1,
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom: Status bar */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs md:max-w-sm">
          {/* Progress bar */}
          <div
            className="w-full h-[2px] rounded-full overflow-hidden"
            style={{ background: 'rgba(244,241,242,0.15)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #fff 0%, #ffb4bc 40%, #e63946 100%)',
                boxShadow: '0 0 10px rgba(230,57,70,0.6)',
                transition: 'width 60ms linear',
              }}
            />
          </div>

          {/* Status row */}
          <div
            className="flex items-center justify-between w-full"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span
              className="text-[0.55rem] tracking-[0.2em] uppercase"
              style={{ color: 'rgba(244,241,242,0.5)' }}
            >
              {showReady ? 'RESOURCES READY' : 'LOADING ASSETS'}
            </span>
            <span
              className="text-[0.55rem] tracking-[0.15em]"
              style={{ color: showReady ? '#e63946' : 'rgba(244,241,242,0.5)' }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
