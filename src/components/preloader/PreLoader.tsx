'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// ─── Constants ───────────────────────────────────────────────────────────────

const SEGMENTS = 60;
const GAP_DEG = 3.5;       // gap between each segment
const RING_R = 42;          // radius in SVG units (viewBox 0 0 100 100)
const CX = 50;
const CY = 50;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(i: number) {
  const segDeg = 360 / SEGMENTS;
  const start = i * segDeg + GAP_DEG / 2;
  const end   = start + segDeg - GAP_DEG;
  const s = polar(CX, CY, RING_R, start);
  const e = polar(CX, CY, RING_R, end);
  const large = segDeg - GAP_DEG > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${RING_R} ${RING_R} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

// Pre-compute all paths once (never changes)
const PATHS = Array.from({ length: SEGMENTS }, (_, i) => arcPath(i));

// ─── Segmented HUD Ring ───────────────────────────────────────────────────────

function SegmentedRing({ progress }: { progress: number }) {
  const lit = Math.round((progress / 100) * SEGMENTS);

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        {/* Glow for the last few active segments */}
        <filter id="pl-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pl-glow-tip" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {PATHS.map((d, i) => {
        const active  = i < lit;
        const isTip   = active && i === lit - 1;
        const isNearTip = active && i >= lit - 4;

        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={
              active
                ? isTip ? '#ff3350' : '#e63946'
                : 'rgba(160, 20, 40, 0.28)'
            }
            strokeWidth={isTip ? '2.6' : active ? '2.2' : '1.8'}
            strokeLinecap="round"
            filter={isTip ? 'url(#pl-glow-tip)' : isNearTip ? 'url(#pl-glow)' : undefined}
            opacity={active ? 1 : 0.9}
          />
        );
      })}
    </svg>
  );
}

// ─── Animated Checkmark ───────────────────────────────────────────────────────

function AnimatedCheckmark() {
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef  = useRef<SVGPathElement>(null);

  useEffect(() => {
    const circleLen = 2 * Math.PI * 38;
    const checkLen  = 55;

    gsap.set(circleRef.current, {
      strokeDasharray: circleLen,
      strokeDashoffset: circleLen,
      opacity: 1,
    });
    gsap.set(checkRef.current, {
      strokeDasharray: checkLen,
      strokeDashoffset: checkLen,
      opacity: 1,
    });

    gsap.timeline()
      .to(circleRef.current, {
        strokeDashoffset: 0,
        duration: 0.55,
        ease: 'power2.out',
      })
      .to(checkRef.current, {
        strokeDashoffset: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.1');
  }, []);

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="ck-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Glowing circle */}
      <circle
        ref={circleRef}
        cx="50" cy="50" r="38"
        fill="none"
        stroke="#e63946"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#ck-glow)"
        opacity={0}
      />
      {/* Checkmark */}
      <path
        ref={checkRef}
        d="M 28 52 L 44 68 L 72 32"
        fill="none"
        stroke="#e63946"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ck-glow)"
        opacity={0}
      />
    </svg>
  );
}

// ─── Decorative line for subtitle ────────────────────────────────────────────

function DecorLine() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 'clamp(24px, 4vw, 48px)',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #e63946 60%, transparent)',
        verticalAlign: 'middle',
        opacity: 0.8,
      }}
    />
  );
}

// ─── Main PreLoader ───────────────────────────────────────────────────────────

export default function PreLoader() {
  const reduced = useReducedMotion();

  const [mounted,   setMounted]   = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [progress,  setProgress]  = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [animDone,  setAnimDone]  = useState(false);
  const [showReady, setShowReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const topRef       = useRef<HTMLDivElement>(null);
  const hudRef       = useRef<HTMLDivElement>(null);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef  = useRef(1);

  // SSR guard
  useEffect(() => { setMounted(true); }, []);

  // Page-ready detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.readyState === 'complete') {
      setPageReady(true);
    } else {
      const h = () => setPageReady(true);
      window.addEventListener('load', h, { once: true });
      return () => window.removeEventListener('load', h);
    }
  }, []);
  // Safety timeout
  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Progress ticker — 1→100 in ~3s (30ms per step)
  const startProgress = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;

      // Hold at 99 until page is actually ready
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

  // Start ticker after entrance animation settles
  useEffect(() => {
    if (!mounted || reduced) return;
    const t = setTimeout(startProgress, 500);
    return () => clearTimeout(t);
  }, [mounted, reduced, startProgress]);

  // Resume from 99 when page becomes ready
  useEffect(() => {
    if (!pageReady || animDone) return;
    if (progressRef.current >= 99 && !intervalRef.current) {
      startProgress();
    }
  }, [pageReady, animDone, startProgress]);

  // Completion sequence
  useEffect(() => {
    if (!animDone) return;
    // Show checkmark after brief pause
    const t1 = setTimeout(() => setShowReady(true), 250);
    // Fade out preloader
    const t2 = setTimeout(() => {
      if (!containerRef.current) { setVisible(false); return; }
      gsap.to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        onComplete: () => setVisible(false),
      });
    }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animDone]);

  // Entrance animation
  useEffect(() => {
    if (!mounted || reduced) return;
    const ctx = gsap.context(() => {
      gsap.set([topRef.current, hudRef.current], { autoAlpha: 0, y: 14 });
      gsap.timeline()
        .to(topRef.current,  { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0)
        .to(hudRef.current,  { autoAlpha: 1, y: 0, duration: 0.5,  ease: 'power2.out' }, 0.2);
    }, containerRef);
    return () => ctx.revert();
  }, [mounted, reduced]);

  // Cleanup interval on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  if (!mounted || !visible || reduced) return null;

  return (
    <div
      ref={containerRef}
      className="pl-root"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* ── Background image ── */}
      <div className="pl-bg">
        <Image
          src="/images/preloader/harshit-shaw-preloader-bg.png"
          alt=""
          fill
          priority
          unoptimized
          draggable={false}
          className="pl-bg-img"
          sizes="100vw"
        />
        {/* Subtle dark overlays for readability */}
        <div className="pl-overlay-top"    aria-hidden="true" />
        <div className="pl-overlay-bottom" aria-hidden="true" />
        <div className="pl-overlay-nebula" aria-hidden="true" />
      </div>

      {/* ── All content, vertically stacked in a column ── */}
      <div className="pl-content">

        {/* TOP: Heading + Subtitle */}
        <div ref={topRef} className="pl-top" aria-hidden="false">
          <h1 className="pl-heading" aria-label="Harshit Shaw">
            <span className="pl-heading-white">HARSH</span>
            <span className="pl-heading-red">IT</span>
            <span className="pl-heading-white"> SHAW</span>
          </h1>
          <p className="pl-subtitle">
            <DecorLine />
            <span className="pl-subtitle-text">INITIALIZING PORTFOLIO</span>
            <DecorLine />
          </p>
        </div>

        {/* CENTER: HUD Ring with percentage or checkmark inside */}
        <div ref={hudRef} className="pl-hud-wrap" aria-label={showReady ? 'System ready' : `${progress}% loaded`}>
          <div className="pl-hud-ring">
            {/* Ring SVG */}
            <div className="pl-ring-svg">
              {showReady
                ? <AnimatedCheckmark />
                : <SegmentedRing progress={progress} />
              }
            </div>

            {/* Centre text — only show when NOT in ready state */}
            {!showReady && (
              <div className="pl-hud-center" aria-hidden="true">
                <span className="pl-pct-num">
                  {progress}
                  <span className="pl-pct-sym">%</span>
                </span>
              </div>
            )}

            {/* SYSTEM READY label below ring */}
            {showReady && (
              <div className="pl-ready-label" aria-live="assertive">
                <p className="pl-ready-text">
                  <DecorLine />
                  <span style={{ margin: '0 10px' }}>SYSTEM READY</span>
                  <DecorLine />
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
