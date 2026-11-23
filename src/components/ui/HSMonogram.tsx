'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * HSMonogram — animated SVG lettermark for the navbar.
 * Runs the draw animation exactly once on mount via a ref guard.
 *
 * Layout (viewBox 0 0 60 60):
 *   H: left vertical x=5→5 y=5→55, right vertical x=20→20 y=5→55, crossbar y=30 x=5→20
 *   S: smooth S-curve x=26–55 y=5–55, sharing visual baseline with H
 *   The H right vertical and S top-left curve begin near the same x/y region
 *   to create an interlocked emblem effect.
 *
 * Animation (runs once):
 *   1. H strokes draw in via strokeDashoffset (0.55s, power2.inOut)
 *   2. S draws in with 120ms overlap after H starts (0.5s, power2.inOut)
 *   3. 250ms pause (both fully drawn)
 *   4. Crimson gradient rect sweeps left→right (0.4s)
 *   5. Settles to static final state
 *
 * Hover: drop-shadow + scale(1.05) via CSS transition.
 */
export default function HSMonogram() {
  const animatedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const hLeftRef = useRef<SVGPathElement>(null);
  const hRightRef = useRef<SVGPathElement>(null);
  const hBarRef = useRef<SVGPathElement>(null);
  const sPathRef = useRef<SVGPathElement>(null);
  const sweepRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    const svg = svgRef.current;
    const hLeft = hLeftRef.current;
    const hRight = hRightRef.current;
    const hBar = hBarRef.current;
    const sPath = sPathRef.current;
    const sweep = sweepRef.current;
    if (!svg || !hLeft || !hRight || !hBar || !sPath || !sweep) return;

    const hLeftLen = hLeft.getTotalLength();
    const hRightLen = hRight.getTotalLength();
    const hBarLen = hBar.getTotalLength();
    const sLen = sPath.getTotalLength();

    // Start fully hidden
    gsap.set(hLeft, { strokeDasharray: hLeftLen, strokeDashoffset: hLeftLen, opacity: 1 });
    gsap.set(hRight, { strokeDasharray: hRightLen, strokeDashoffset: hRightLen, opacity: 1 });
    gsap.set(hBar, { strokeDasharray: hBarLen, strokeDashoffset: hBarLen, opacity: 1 });
    gsap.set(sPath, { strokeDasharray: sLen, strokeDashoffset: sLen, opacity: 1 });
    gsap.set(sweep, { opacity: 0, x: -65 });
    gsap.set(svg, { opacity: 1 });

    const tl = gsap.timeline();

    // 1. Draw H strokes
    tl.to(hLeft, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' })
      .to(hRight, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' }, '-=0.2')
      .to(hBar, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.out' }, '-=0.12');

    // 2. S draws in with 120ms overlap after H starts
    tl.to(sPath, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.38');

    // 3. 250ms pause, then crimson sweep
    tl.to(sweep, { opacity: 0.7, duration: 0.07, ease: 'none' }, '+=0.25');
    tl.to(sweep, { x: 70, duration: 0.4, ease: 'power1.inOut' }, '<');
    tl.to(sweep, { opacity: 0, duration: 0.1, ease: 'none' }, '-=0.1');
  }, []);

  return (
    <>
    <svg
      ref={svgRef}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity: 0,
        overflow: 'visible',
        display: 'block',
        height: 'clamp(32px, 4vw, 44px)',
        width: 'auto',
      }}
      aria-hidden="true"
      className="hs-monogram-svg"
    >
        <defs>
          <linearGradient id="hs-sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc143c" stopOpacity="0" />
            <stop offset="30%" stopColor="#dc143c" stopOpacity="1" />
            <stop offset="70%" stopColor="#ff4060" stopOpacity="1" />
            <stop offset="100%" stopColor="#dc143c" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hs-mono-clip">
            <rect x="0" y="0" width="60" height="60" />
          </clipPath>
        </defs>

        {/*
          H letterform — custom paths for staggered draw animation.
          Left vertical:  x=5, y=5→55
          Right vertical: x=21, y=5→55
          Crossbar:       y=30, x=5→21

          The H right vertical ends at x=21 — the S curve starts at x=24 near
          the top, creating a tight visual integration between the two letters.
        */}
        {/* H left vertical */}
        <path
          ref={hLeftRef}
          d="M 5 5 L 5 55"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* H right vertical */}
        <path
          ref={hRightRef}
          d="M 21 5 L 21 55"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* H crossbar — connects to S at the crossbar height */}
        <path
          ref={hBarRef}
          d="M 5 30 L 21 30"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/*
          S letterform — smooth cubic bezier S-curve.
          Starts at (42, 8) top-right, arcs to (27, 30) center-left,
          then back to (42, 52) bottom-right.
          x range: 24–46  y range: 7–53
          The S top-left arc (around x=24) nearly meets the H right vertical
          (x=21) at mid-height, achieving visual integration / interlocking.
        */}
        <path
          ref={sPathRef}
          d="M 44 12 C 44 8 41 7 36.5 7 C 30 7 26.5 10.5 26.5 15.5 C 26.5 20 29.5 22.5 34.5 25 C 39.5 27.5 43.5 30 43.5 35.5 C 43.5 41 40 53 32 53 C 27 53 24.5 50.5 24.5 47.5"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Crimson sweep overlay — clipped to SVG bounds */}
        <g clipPath="url(#hs-mono-clip)">
          <rect
            ref={sweepRef}
            x="-18"
            y="0"
            width="26"
            height="60"
            fill="url(#hs-sweep-grad)"
            style={{ opacity: 0 }}
          />
        </g>
      </svg>

      <style>{`
        .hs-monogram-svg {
          transition: filter 0.2s ease, transform 0.2s ease;
        }
      `}</style>
    </>
  );
}
