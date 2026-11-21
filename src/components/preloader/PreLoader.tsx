'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

// ─── Ring geometry ────────────────────────────────────────────────────────────
const SEGS      = 60;
const GAP       = 3.6;    // degrees gap between segments
const R_OUTER   = 46;     // outer radius — increased for taller segments
const R_INNER   = 40;     // inner radius — gap from centre
const CX        = 50;
const CY        = 50;
const TRAIL_LEN = 8;

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// Each segment is now a radial line from R_INNER → R_OUTER (taller dash look)
function dashPath(i: number): string {
  const span   = 360 / SEGS;
  // mid-angle of this segment
  const midDeg = i * span + span / 2;
  // start of arc (for the arc-based approach keeping original style but taller)
  const a0 = i * span + GAP / 2;
  const a1 = a0 + span - GAP;
  const s0 = polar(R_INNER, a0);
  const s1 = polar(R_INNER, a1);
  const e0 = polar(R_OUTER, a0);
  const e1 = polar(R_OUTER, a1);
  // Trapezoid path: inner-arc start → inner-arc end → outer-arc end → outer-arc start
  // This creates a solid radial segment shape (tall dash)
  // Simplified: use two concentric arc segments connected — standard radial HUD segment
  const innerArcLarge = span - GAP > 180 ? 1 : 0;
  const outerArcLarge = span - GAP > 180 ? 1 : 0;
  return [
    `M ${s0.x.toFixed(3)} ${s0.y.toFixed(3)}`,
    `A ${R_INNER} ${R_INNER} 0 ${innerArcLarge} 1 ${s1.x.toFixed(3)} ${s1.y.toFixed(3)}`,
    `L ${e1.x.toFixed(3)} ${e1.y.toFixed(3)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${outerArcLarge} 0 ${e0.x.toFixed(3)} ${e0.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

// Also keep a midpoint radial line for the glow overlay on the tip
function midLine(i: number): string {
  const span   = 360 / SEGS;
  const midDeg = i * span + span / 2;
  const inner  = polar(R_INNER - 1, midDeg);
  const outer  = polar(R_OUTER + 1, midDeg);
  return `M ${inner.x.toFixed(3)} ${inner.y.toFixed(3)} L ${outer.x.toFixed(3)} ${outer.y.toFixed(3)}`;
}

const DASH_PATHS = Array.from({ length: SEGS }, (_, i) => dashPath(i));
const LINE_PATHS = Array.from({ length: SEGS }, (_, i) => midLine(i));

// ─── Stable SVG filters — rendered once outside LaserRing ───────────────────
function LaserFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id="lsr-bloom" x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lsr-tip" x="-130%" y="-130%" width="360%" height="360%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2.8" result="b1" />
          <feGaussianBlur stdDeviation="0.9" result="b2" in="SourceGraphic" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── Laser segmented ring ─────────────────────────────────────────────────────
function LaserRing({ progress }: { progress: number }) {
  const lit = Math.round((progress / 100) * SEGS);

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >

      {DASH_PATHS.map((d, i) => {
        const active   = i < lit;
        const isTip    = active && i === lit - 1;
        const trailPos = active ? (lit - 1 - i) : -1;
        const inTrail  = active && trailPos <= TRAIL_LEN;

        if (!active) {
          return (
            <path key={i} d={d}
              fill="rgba(120,16,30,0.28)"
              stroke="none"
            />
          );
        }

        if (isTip) {
          return (
            <g key={i}>
              <path d={d} fill="#ff2040" stroke="none" filter="url(#lsr-tip)" />
              {/* Extra glow line down the centre of the tip */}
              <path d={LINE_PATHS[i]} fill="none" stroke="rgba(255,160,170,0.6)" strokeWidth="0.8" filter="url(#lsr-tip)" />
            </g>
          );
        }

        if (inTrail) {
          const fade  = 1 - trailPos / (TRAIL_LEN + 1);
          const alpha = 0.28 + fade * 0.72;
          return (
            <path key={i} d={d}
              fill={`rgba(220,50,65,${alpha.toFixed(2)})`}
              stroke="none"
              filter={fade > 0.55 ? 'url(#lsr-bloom)' : undefined}
            />
          );
        }

        // Active behind trail
        return (
          <path key={i} d={d}
            fill="rgba(165,22,36,0.72)"
            stroke="none"
          />
        );
      })}
    </svg>
  );
}

// ─── Checkmark — stable, no glitch ───────────────────────────────────────────
// Fix: animate opacity+scale on the whole SVG, then draw circle, then fade tick
// This avoids the distorted-first-frame that stroke-dashoffset causes with glow filters.
const CK_CIRCLE_LEN = +(2 * Math.PI * 36).toFixed(2);
const CK_PATH_LEN   = 54;

function AnimatedCheckmark() {
  const wrapRef   = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef  = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !circleRef.current || !checkRef.current) return;

    // 1. SVG starts invisible (opacity 0 set inline on the element via GSAP set)
    gsap.set(wrapRef.current,  { opacity: 0, scale: 0.88, transformOrigin: '50% 50%' });
    // 2. Paths start fully hidden via their inline SVG strokeDashoffset attrs
    // (already set in JSX)

    gsap.timeline({ defaults: { ease: 'power2.out' } })
      // fade+scale the whole SVG in first so the glow filter renders on a stable element
      .to(wrapRef.current,  { opacity: 1, scale: 1, duration: 0.22 })
      // then draw the circle
      .to(circleRef.current, { strokeDashoffset: 0, duration: 0.60 }, '-=0.05')
      // then draw the tick
      .to(checkRef.current,  { strokeDashoffset: 0, duration: 0.38 }, '-=0.10');
  }, []);

  return (
    <svg
      ref={wrapRef}
      viewBox="0 0 100 100" width="100%" height="100%"
      style={{ display: 'block', overflow: 'visible', opacity: 0 }}
      aria-hidden="true"
    >
      <defs>
        <filter id="ck-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Circle — hidden via inline strokeDashoffset = full length */}
      <circle
        ref={circleRef}
        cx="50" cy="50" r="36"
        fill="none"
        stroke="#e63946"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#ck-glow)"
        strokeDasharray={CK_CIRCLE_LEN}
        strokeDashoffset={CK_CIRCLE_LEN}
      />

      {/* Checkmark — hidden via inline strokeDashoffset = full length */}
      <path
        ref={checkRef}
        d="M 29 52 L 44 67 L 71 33"
        fill="none"
        stroke="#e63946"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ck-glow)"
        strokeDasharray={CK_PATH_LEN}
        strokeDashoffset={CK_PATH_LEN}
      />
    </svg>
  );
}

// ─── Decorative line ──────────────────────────────────────────────────────────
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

// ─── Main PreLoader ───────────────────────────────────────────────────────────
export default function PreLoader() {
  const reduced = useReducedMotion();

  // FIX 1: Don't gate on `mounted` — render immediately on first paint.
  // We use `visible` state only to remove from DOM after exit animation.
  const [visible,   setVisible]   = useState(true);
  const [progress,  setProgress]  = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [animDone,  setAnimDone]  = useState(false);
  const [showReady, setShowReady] = useState(false);

  const rootRef      = useRef<HTMLDivElement>(null);
  const groupRef     = useRef<HTMLDivElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef  = useRef(1);
  const startedRef   = useRef(false);
  const pageReadyRef = useRef(false); // ref so interval closure always sees fresh value

  // ── Page-ready detection ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const markReady = () => {
      pageReadyRef.current = true;
      setPageReady(true);
    };
    if (document.readyState === 'complete') { markReady(); return; }
    window.addEventListener('load', markReady, { once: true });
    return () => window.removeEventListener('load', markReady);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      pageReadyRef.current = true;
      setPageReady(true);
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  // ── Progress ticker ──
  const startProgress = useCallback(() => {
    if (intervalRef.current || startedRef.current) return;
    startedRef.current = true;
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;

      // Use ref — not stale closure — to check page readiness
      if (progressRef.current >= 99 && !pageReadyRef.current) {
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
  }, []); // no deps — reads live values via refs

  // Start immediately on mount — no 400ms delay waiting for `mounted`
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(startProgress, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount

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
        onComplete: () => {
          setVisible(false);
          // Signal hero to trigger its entrance animation
          window.dispatchEvent(new CustomEvent('preloader:done'));
        },
      });
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animDone]);

  // ── Entrance fade-up for the content group ──
  useEffect(() => {
    if (reduced || !groupRef.current) return;
    gsap.fromTo(groupRef.current,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.05 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once on mount

  // ── Interval cleanup ──
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  if (reduced) return null;
  // NOTE: We always render even before JS hydrates so the fixed overlay
  // blocks the hero on the initial server-rendered HTML paint.
  // `visible` only controls removal from DOM after exit animation.
  if (!visible) return null;

  return (
    <div ref={rootRef} className="pl-root" role="status" aria-live="polite" aria-label="Loading portfolio">

      {/* ── Background ── */}
      <div className="pl-bg" aria-hidden="true">
        <Image
          src="/images/preloader/harshit-shaw-preloader-bg.png"
          alt="" fill priority unoptimized draggable={false}
          className="pl-bg-img" sizes="100vw"
        />
        <div className="pl-ov-top" />
        <div className="pl-ov-bottom" />
        <div className="pl-ov-nebula" />
      </div>

      {/* ── FIX 2: Entire heading+gap+hud as ONE group, vertically centred ── */}
      <div className="pl-layout">
        <div ref={groupRef} className="pl-group">

          {/* HEADING */}
          <div className="pl-top">
            <h1 className="pl-heading" aria-label="Harshit Shaw">
              <span className="pl-hw">HARSHIT</span>
              <span className="pl-hr"> SHAW</span>
            </h1>
            <p className="pl-sub">
              <DecorLine flip />
              <span className="pl-sub-text">INITIALIZING PORTFOLIO</span>
              <DecorLine />
            </p>
          </div>

          {/* GAP — preserved exactly */}
          <div className="pl-gap" aria-hidden="true" />

          {/* HUD */}
          <div className="pl-hud">
            <LaserFilters />
            <div className="pl-ring">
              {showReady ? <AnimatedCheckmark /> : <LaserRing progress={progress} />}
            </div>

            {!showReady && (
              <div className="pl-pct-wrap" aria-hidden="true">
                <span className="pl-pct">
                  {progress}<span className="pl-pct-unit">%</span>
                </span>
              </div>
            )}

            {showReady && (
              <div className="pl-ready" aria-live="assertive">
                <DecorLine flip />
                <span className="pl-ready-text">SYSTEM READY</span>
                <DecorLine />
              </div>
            )}
          </div>

        </div>{/* /pl-group */}
      </div>
    </div>
  );
}
