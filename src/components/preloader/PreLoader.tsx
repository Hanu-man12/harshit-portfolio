'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// ─── Ring geometry constants ──────────────────────────────────────────────────
const SEGS      = 60;
const GAP       = 3.8;   // degrees gap between segments
const R         = 44;    // SVG radius (viewBox 100×100)
const CX        = 50;
const CY        = 50;
const TRAIL_LEN = 8;     // how many segments fade in the laser trail

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arc(i: number): string {
  const span = 360 / SEGS;
  const a0   = i * span + GAP / 2;
  const a1   = a0 + span - GAP;
  const s    = polar(R, a0);
  const e    = polar(R, a1);
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${R} ${R} 0 0 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

// Pre-build paths — static, no re-compute on render
const PATHS = Array.from({ length: SEGS }, (_, i) => arc(i));

// ─── Laser segmented ring ─────────────────────────────────────────────────────
function LaserRing({ progress }: { progress: number }) {
  // lit = how many segments are "charged"
  const lit = Math.round((progress / 100) * SEGS);

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Soft bloom for trail segments */}
        <filter id="lsr-bloom" x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Intense bloom for laser tip */}
        <filter id="lsr-tip" x="-120%" y="-120%" width="340%" height="340%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2.6" result="b1" />
          <feGaussianBlur stdDeviation="1.0" result="b2" in="SourceGraphic" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {PATHS.map((d, i) => {
        const active = i < lit;

        if (!active) {
          // Inactive — dim dark-red tick
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="rgba(140,18,34,0.32)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          );
        }

        const isTip    = i === lit - 1;
        const trailPos = lit - 1 - i;            // 0 = tip, 1,2,… = behind
        const inTrail  = trailPos <= TRAIL_LEN;

        if (isTip) {
          // Laser head — brightest, intense glow
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#ff2040"
              strokeWidth="3.2"
              strokeLinecap="round"
              filter="url(#lsr-tip)"
            />
          );
        }

        if (inTrail) {
          // Trail — fades from bright to dim going backwards
          const fade  = 1 - trailPos / (TRAIL_LEN + 1);  // 1 near tip → 0 at tail
          const alpha = 0.35 + fade * 0.65;
          const width = 1.8 + fade * 0.6;
          const color = `rgba(230,57,70,${alpha.toFixed(2)})`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={width.toFixed(2)}
              strokeLinecap="round"
              filter={fade > 0.6 ? 'url(#lsr-bloom)' : undefined}
            />
          );
        }

        // Active but behind trail — steady crimson, no glow
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#b01828"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />
        );
      })}
    </svg>
  );
}

// ─── Animated checkmark (draw-on) ────────────────────────────────────────────
function AnimatedCheckmark() {
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef  = useRef<SVGPathElement>(null);

  useEffect(() => {
    const cLen = 2 * Math.PI * 36;
    const kLen = 52;

    gsap.set(circleRef.current, { strokeDasharray: cLen, strokeDashoffset: cLen, opacity: 1 });
    gsap.set(checkRef.current,  { strokeDasharray: kLen, strokeDashoffset: kLen, opacity: 1 });

    gsap.timeline()
      .to(circleRef.current, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' })
      .to(checkRef.current,  { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, '-=0.15');
  }, []);

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%"
      style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <defs>
        <filter id="ck-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle ref={circleRef} cx="50" cy="50" r="36"
        fill="none" stroke="#e63946" strokeWidth="2"
        strokeLinecap="round" filter="url(#ck-glow)" opacity={0} />
      <path ref={checkRef} d="M 29 52 L 44 67 L 71 33"
        fill="none" stroke="#e63946" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round"
        filter="url(#ck-glow)" opacity={0} />
    </svg>
  );
}

// ─── Thin decorative line ─────────────────────────────────────────────────────
function DecorLine({ flip }: { flip?: boolean }) {
  return (
    <span aria-hidden="true" style={{
      display: 'inline-block',
      width: 'clamp(20px, 3.5vw, 44px)',
      height: '1px',
      background: flip
        ? 'linear-gradient(90deg, transparent, rgba(230,57,70,0.75))'
        : 'linear-gradient(90deg, rgba(230,57,70,0.75), transparent)',
      verticalAlign: 'middle',
      flexShrink: 0,
    }} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PreLoader() {
  const reduced = useReducedMotion();

  const [mounted,   setMounted]   = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [progress,  setProgress]  = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [animDone,  setAnimDone]  = useState(false);
  const [showReady, setShowReady] = useState(false);

  const rootRef    = useRef<HTMLDivElement>(null);
  const topRef     = useRef<HTMLDivElement>(null);
  const hudRef     = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(1);

  // ── Mount guard (SSR safe) ──
  useEffect(() => { setMounted(true); }, []);

  // ── Page-ready detection ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.readyState === 'complete') { setPageReady(true); return; }
    const h = () => setPageReady(true);
    window.addEventListener('load', h, { once: true });
    return () => window.removeEventListener('load', h);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // ── Progress ticker: 1→100 in ~3 s (30 ms/step) ──
  const startProgress = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;

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

  useEffect(() => {
    if (!mounted || reduced) return;
    const t = setTimeout(startProgress, 400);
    return () => clearTimeout(t);
  }, [mounted, reduced, startProgress]);

  useEffect(() => {
    if (!pageReady || animDone) return;
    if (progressRef.current >= 99 && !intervalRef.current) startProgress();
  }, [pageReady, animDone, startProgress]);

  // ── Completion sequence ──
  useEffect(() => {
    if (!animDone) return;
    const t1 = setTimeout(() => setShowReady(true), 220);
    const t2 = setTimeout(() => {
      if (!rootRef.current) { setVisible(false); return; }
      gsap.to(rootRef.current, {
        autoAlpha: 0, duration: 0.8, ease: 'power2.inOut',
        onComplete: () => setVisible(false),
      });
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animDone]);

  // ── Entrance animation ──
  useEffect(() => {
    if (!mounted || reduced) return;
    const ctx = gsap.context(() => {
      gsap.set([topRef.current, hudRef.current], { autoAlpha: 0, y: 16 });
      gsap.timeline()
        .to(topRef.current, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0)
        .to(hudRef.current, { autoAlpha: 1, y: 0, duration: 0.5,  ease: 'power2.out' }, 0.18);
    }, rootRef);
    return () => ctx.revert();
  }, [mounted, reduced]);

  // ── Interval cleanup ──
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  if (!mounted || !visible || reduced) return null;

  return (
    <div ref={rootRef} className="pl-root" role="status" aria-live="polite" aria-label="Loading portfolio">

      {/* ── Background ── */}
      <div className="pl-bg" aria-hidden="true">
        <Image
          src="/images/preloader/harshit-shaw-preloader-bg.png"
          alt="" fill priority unoptimized draggable={false}
          className="pl-bg-img" sizes="100vw"
        />
        <div className="pl-ov-top"    />
        <div className="pl-ov-bottom" />
        <div className="pl-ov-nebula" />
      </div>

      {/* ── Layout: heading above ring, everything centred ── */}
      <div className="pl-layout">

        {/* HEADING BLOCK */}
        <div ref={topRef} className="pl-top">
          <h1 className="pl-heading" aria-label="Harshit Shaw">
            <span className="pl-hw">HARSH</span><span className="pl-hr">IT</span><span className="pl-hw"> SHAW</span>
          </h1>
          <p className="pl-sub">
            <DecorLine flip />
            <span className="pl-sub-text">INITIALIZING PORTFOLIO</span>
            <DecorLine />
          </p>
        </div>

        {/* SPACER — explicit gap between heading and ring */}
        <div className="pl-gap" aria-hidden="true" />

        {/* HUD RING BLOCK */}
        <div ref={hudRef} className="pl-hud">

          {/* SVG ring or checkmark */}
          <div className="pl-ring">
            {showReady ? <AnimatedCheckmark /> : <LaserRing progress={progress} />}
          </div>

          {/* Centre: big % (loading) or nothing (ready, check is inside SVG) */}
          {!showReady && (
            <div className="pl-pct-wrap" aria-hidden="true">
              <span className="pl-pct">
                {progress}<span className="pl-pct-unit">%</span>
              </span>
            </div>
          )}

          {/* SYSTEM READY — below ring, only when done */}
          {showReady && (
            <div className="pl-ready" aria-live="assertive">
              <DecorLine flip />
              <span className="pl-ready-text">SYSTEM READY</span>
              <DecorLine />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
