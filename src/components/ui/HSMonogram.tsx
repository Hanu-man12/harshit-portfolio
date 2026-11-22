'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * HSMonogram — animated SVG lettermark for the navbar.
 * Runs the draw animation exactly once on mount via a ref guard.
 * Uses GSAP stroke-dashoffset for the draw-in, then a gradient sweep.
 */
export default function HSMonogram() {
  const animatedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const hPathRef = useRef<SVGPathElement>(null);
  const sPathRef = useRef<SVGPathElement>(null);
  const sweepRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    const svg = svgRef.current;
    const hPath = hPathRef.current;
    const sPath = sPathRef.current;
    const sweep = sweepRef.current;
    if (!svg || !hPath || !sPath || !sweep) return;

    // Measure actual path lengths
    const hLen = hPath.getTotalLength();
    const sLen = sPath.getTotalLength();

    // Set initial dasharray/dashoffset so paths are invisible
    gsap.set(hPath, {
      strokeDasharray: hLen,
      strokeDashoffset: hLen,
      opacity: 1,
    });
    gsap.set(sPath, {
      strokeDasharray: sLen,
      strokeDashoffset: sLen,
      opacity: 1,
    });
    gsap.set(sweep, { opacity: 0, x: -44 });
    gsap.set(svg, { opacity: 1 });

    const tl = gsap.timeline();

    // 1. Draw H
    tl.to(hPath, {
      strokeDashoffset: 0,
      duration: 0.65,
      ease: 'power2.inOut',
    });

    // 2. Draw S with ~180ms overlap
    tl.to(sPath, {
      strokeDashoffset: 0,
      duration: 0.65,
      ease: 'power2.inOut',
    }, '-=0.47');

    // 3. Brief pause (handled by next step's delay)
    // 4. Crimson light sweep left→right
    tl.to(sweep, {
      opacity: 0.6,
      duration: 0.1,
      ease: 'none',
    }, '+=0.18');

    tl.to(sweep, {
      x: 44,
      duration: 0.45,
      ease: 'power1.inOut',
    }, '<');

    tl.to(sweep, {
      opacity: 0,
      duration: 0.15,
      ease: 'none',
    }, '-=0.1');
  }, []);

  return (
    <a
      href="/"
      aria-label="Harshit Shaw home"
      className="hs-monogram-link"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 44 36"
        width="44"
        height="36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0, overflow: 'visible', display: 'block' }}
        aria-hidden="true"
        className="hs-monogram-svg"
      >
        <defs>
          <linearGradient id="hs-sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e63946" stopOpacity="0" />
            <stop offset="40%" stopColor="#e63946" stopOpacity="1" />
            <stop offset="60%" stopColor="#ff6b74" stopOpacity="1" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hs-clip">
            <rect x="0" y="0" width="44" height="36" />
          </clipPath>
        </defs>

        {/*
          H letterform:
          Two vertical strokes + crossbar.
          Left stroke: (4,4) → (4,32)
          Right stroke: (18,4) → (18,32)
          Crossbar: (4,18) → (18,18)
          Using a single continuous path for clean draw animation.
        */}
        <path
          ref={hPathRef}
          d="M 4 4 L 4 32 M 4 18 L 18 18 M 18 4 L 18 32"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--text)' }}
        />

        {/*
          S letterform:
          Begins top-right, curves around to left, then back to right at bottom.
          Path sits at x: 24–40, y: 4–32
        */}
        <path
          ref={sPathRef}
          d="M 39 8 C 39 5 36 4 32 4 C 26 4 24 7 24 11 C 24 15 27 17 32 18 C 37 19 40 21 40 25 C 40 29 38 32 32 32 C 27 32 24 30 24 28"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sweep overlay — clipped to SVG bounds */}
        <g clipPath="url(#hs-clip)">
          <rect
            ref={sweepRef}
            x="-10"
            y="0"
            width="20"
            height="36"
            fill="url(#hs-sweep-grad)"
            style={{ opacity: 0 }}
          />
        </g>
      </svg>

      <style>{`
        .hs-monogram-link {
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .hs-monogram-link:hover .hs-monogram-svg {
          filter: drop-shadow(0 0 6px var(--accent-glow));
          transform: scale(1.08);
        }
      `}</style>
    </a>
  );
}
