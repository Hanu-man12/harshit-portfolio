'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

/**
 * HSMonogram — animated SVG lettermark for the navbar.
 * Runs the draw animation exactly once on mount via a ref guard.
 *
 * Layout (viewBox 0 0 44 36):
 *   H: left vertical x=4 y=4→32, right vertical x=18 y=4→32, crossbar y=18 x=4→18
 *   S: smooth S-curve x=24–40 y=4–32
 *   Both share baseline y=32 for visual integration.
 *
 * Animation:
 *   1. H strokes draw in via strokeDashoffset (0.6s)
 *   2. S draws in with 150ms overlap after H starts (0.5s)
 *   3. 300ms pause (both fully drawn)
 *   4. Crimson gradient rect sweeps left→right (0.4s)
 *   5. Settles to static final state
 */
export default function HSMonogram() {
  const animatedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // H — three separate path refs for independent stroke measurements
  const hLeftRef = useRef<SVGPathElement>(null);
  const hRightRef = useRef<SVGPathElement>(null);
  const hBarRef = useRef<SVGPathElement>(null);

  // S — single smooth S-curve
  const sPathRef = useRef<SVGPathElement>(null);

  // Sweep overlay
  const sweepRef = useRef<SVGRectElement>(null);

  const router = useRouter();

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

    // Start invisible
    gsap.set([hLeft, hRight, hBar], {
      strokeDasharray: (i, el) => {
        const lens = [hLeftLen, hRightLen, hBarLen];
        return lens[i];
      },
      strokeDashoffset: (i) => {
        const lens = [hLeftLen, hRightLen, hBarLen];
        return lens[i];
      },
      opacity: 1,
    });
    gsap.set(sPath, { strokeDasharray: sLen, strokeDashoffset: sLen, opacity: 1 });
    gsap.set(sweep, { opacity: 0, x: -50 });
    gsap.set(svg, { opacity: 1 });

    const tl = gsap.timeline();

    // 1. Draw H: left vertical first, then right, bar overlaps right
    tl.to(hLeft, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' })
      .to(hRight, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' }, '-=0.2')
      .to(hBar, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.out' }, '-=0.12');

    // 2. S draws in with ~150ms overlap after H starts
    tl.to(sPath, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.38');

    // 3. Brief pause 0.3s (via delay on sweep step)
    // 4. Crimson gradient sweep left → right
    tl.to(sweep, { opacity: 0.65, duration: 0.08, ease: 'none' }, '+=0.3');
    tl.to(sweep, { x: 54, duration: 0.42, ease: 'power1.inOut' }, '<');
    tl.to(sweep, { opacity: 0, duration: 0.12, ease: 'none' }, '-=0.12');
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    router.push('/');
  }

  return (
    <a
      href="/"
      onClick={handleClick}
      aria-label="Harshit Shaw home"
      className="hs-monogram-link"
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 44 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0,
          overflow: 'visible',
          display: 'block',
          width: 'clamp(32px, 5vw, 44px)',
          height: 'clamp(26px, 4vw, 36px)',
        }}
        aria-hidden="true"
        className="hs-monogram-svg"
      >
        <defs>
          <linearGradient id="hs-sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e63946" stopOpacity="0" />
            <stop offset="35%" stopColor="#e63946" stopOpacity="1" />
            <stop offset="65%" stopColor="#ff6b74" stopOpacity="1" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hs-clip">
            <rect x="0" y="0" width="44" height="36" />
          </clipPath>
        </defs>

        {/*
          H letterform — three distinct paths for staggered draw animation.
          Left vertical: (4,4)→(4,32)
          Right vertical: (18,4)→(18,32)
          Crossbar: (4,18)→(18,18)
          Rounded caps for a refined stroke weight.
        */}
        {/* H left vertical */}
        <path
          ref={hLeftRef}
          d="M 4 4 L 4 32"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* H right vertical */}
        <path
          ref={hRightRef}
          d="M 18 4 L 18 32"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* H crossbar */}
        <path
          ref={hBarRef}
          d="M 4 18 L 18 18"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/*
          S letterform — smooth cubic bezier S-curve.
          Starts top-right, arcs to left center, then back to right at bottom.
          x range: 24–40, y range: 4–32
          Connecting stroke: starts at x=18 (H right vertical) for visual integration.
        */}
        <path
          ref={sPathRef}
          d="M 40 9 C 40 5.5 37 4 33 4 C 27.5 4 25 7 25 11 C 25 14.5 27.5 16.5 32 18 C 36.5 19.5 39.5 21.5 39.5 25.5 C 39.5 29.5 37 32 32 32 C 27.5 32 25 30 25 27.5"
          stroke="var(--accent)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Crimson sweep overlay — clipped to SVG bounds */}
        <g clipPath="url(#hs-clip)">
          <rect
            ref={sweepRef}
            x="-12"
            y="0"
            width="22"
            height="36"
            fill="url(#hs-sweep-grad)"
            style={{ opacity: 0 }}
          />
        </g>
      </svg>

      <style>{`
        .hs-monogram-link {
          cursor: pointer;
          text-decoration: none;
        }
        .hs-monogram-link:hover .hs-monogram-svg {
          filter: drop-shadow(0 0 6px var(--accent-glow));
          transform: scale(1.05);
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .hs-monogram-svg {
          transition: filter 0.2s ease, transform 0.2s ease;
        }
      `}</style>
    </a>
  );
}
