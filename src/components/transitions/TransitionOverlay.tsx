'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { usePageTransition, TransitionType } from './TransitionContext';

// ─── Shared style helpers ─────────────────────────────────────────────────────
const ORBITRON: React.CSSProperties = {
  fontFamily: "'Orbitron', var(--font-display-orbitron), monospace",
  fontWeight: 800,
};

const OVERLAY_BASE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  overflow: 'hidden',
  pointerEvents: 'all',
};

// ─── Crimson corner accents ───────────────────────────────────────────────────
function CrimsonCornerAccents() {
  const corner: React.CSSProperties = {
    position: 'absolute',
    width: 'clamp(18px, 2.5vw, 36px)',
    height: 'clamp(18px, 2.5vw, 36px)',
    borderColor: 'rgba(220,20,60,0.5)',
    borderStyle: 'solid',
  };
  return (
    <div aria-hidden="true">
      <div style={{ ...corner, top: 20, left: 20, borderWidth: '2px 0 0 2px' }} />
      <div style={{ ...corner, top: 20, right: 20, borderWidth: '2px 2px 0 0' }} />
      <div style={{ ...corner, bottom: 20, left: 20, borderWidth: '0 0 2px 2px' }} />
      <div style={{ ...corner, bottom: 20, right: 20, borderWidth: '0 2px 2px 0' }} />
    </div>
  );
}

// ─── Shared branding text ─────────────────────────────────────────────────────
function BrandingText({ subtitle }: { subtitle: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        gap: '0.6rem',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          ...ORBITRON,
          fontSize: 'clamp(1.4rem, 4.5vw, 3rem)',
          letterSpacing: '0.15em',
          color: '#ffffff',
          textShadow: '0 0 24px rgba(220,20,60,0.85), 0 0 48px rgba(220,20,60,0.4)',
          textAlign: 'center',
        }}
      >
        HARSHIT SHAW
      </span>
      <span
        style={{
          ...ORBITRON,
          fontSize: 'clamp(0.55rem, 1.3vw, 0.85rem)',
          letterSpacing: '0.3em',
          color: '#dc143c',
          textShadow: '0 0 10px rgba(220,20,60,0.9)',
          textAlign: 'center',
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

// ─── Props shared by all curtain components ───────────────────────────────────
interface CurtainProps {
  /** Called when curtain fully covers the screen → router.push should fire */
  onReady: () => void;
  /** Called when reveal animation finishes → remove overlay */
  onDone: () => void;
}

// ─── A. Contact — Vertical Falling Curtain ───────────────────────────────────
function ContactCurtain({ onReady, onDone }: CurtainProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const safetyTimer = setTimeout(onDone, 5000);

    gsap.set(panel, { y: '-100%' });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimer);
        onDone();
      },
    });

    tl.to(panel, { y: '0%', duration: 0.6, ease: 'power2.inOut' })
      .call(onReady)
      .to(panel, { y: '0%', duration: 0.4 }) // hold
      .to(panel, { y: '-100%', duration: 0.6, ease: 'power2.inOut' });

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={panelRef} style={{ ...OVERLAY_BASE, background: '#0a0a0a' }}>
      <BrandingText subtitle="ESTABLISHING CONNECTION" />
      <CrimsonCornerAccents />
    </div>
  );
}

// ─── B. Projects — Horizontal Curtain ────────────────────────────────────────
function ProjectsCurtain({ onReady, onDone }: CurtainProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const safetyTimer = setTimeout(onDone, 5000);

    gsap.set(panel, { x: '-100%' });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimer);
        onDone();
      },
    });

    tl.to(panel, { x: '0%', duration: 0.6, ease: 'power2.inOut' })
      .call(onReady)
      .to(panel, { x: '0%', duration: 0.4 }) // hold
      .to(panel, { x: '100%', duration: 0.6, ease: 'power2.inOut' });

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={panelRef} style={{ ...OVERLAY_BASE, background: '#0a0a0a' }}>
      <BrandingText subtitle="LOADING PROJECT ARCHIVE" />
      <CrimsonCornerAccents />
    </div>
  );
}

// ─── C. Work — Dual Panel Curtain ────────────────────────────────────────────
function WorkCurtain({ onReady, onDone }: CurtainProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const text = textRef.current;
    if (!left || !right || !text) return;

    const safetyTimer = setTimeout(onDone, 5000);

    gsap.set(left, { x: '-100%' });
    gsap.set(right, { x: '100%' });
    gsap.set(text, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimer);
        onDone();
      },
    });

    tl.to([left, right], { x: '0%', duration: 0.7, ease: 'power2.inOut' })
      .to(text, { opacity: 1, duration: 0.2 }, '-=0.1')
      .call(onReady)
      .to(text, { opacity: 1, duration: 0.4 }) // hold
      .to(text, { opacity: 0, duration: 0.15 })
      .to(left, { x: '-100%', duration: 0.7, ease: 'power2.inOut' }, '-=0.05')
      .to(right, { x: '100%', duration: 0.7, ease: 'power2.inOut' }, '<');

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    background: '#0a0a0a',
    overflow: 'hidden',
  };

  return (
    <div style={{ ...OVERLAY_BASE }}>
      {/* Left panel */}
      <div ref={leftRef} style={{ ...panelStyle, left: 0 }} />
      {/* Right panel */}
      <div ref={rightRef} style={{ ...panelStyle, right: 0 }} />
      {/* Branding text above both panels */}
      <div ref={textRef} style={{ position: 'absolute', inset: 0, zIndex: 10, opacity: 0 }}>
        <BrandingText subtitle="ACCESSING OPEN SOURCE" />
      </div>
    </div>
  );
}

// ─── D. About — Crimson Laser Curtain ────────────────────────────────────────
function AboutCurtain({ onReady, onDone }: CurtainProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const scanLine = scanLineRef.current;
    if (!overlay || !scanLine) return;

    const safetyTimer = setTimeout(onDone, 5000);

    gsap.set(overlay, { clipPath: 'circle(0% at 50% 50%)' });
    gsap.set(scanLine, { top: '-2px', opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimer);
        onDone();
      },
    });

    // Expand clip-path and sweep scan line simultaneously
    tl.to(overlay, { clipPath: 'circle(150% at 50% 50%)', duration: 0.8, ease: 'power2.inOut' })
      .to(scanLine, { top: '100%', opacity: 1, duration: 0.8, ease: 'none' }, '<')
      .call(onReady)
      .to({}, { duration: 0.5 }) // hold
      // Retract: scan sweeps back up + overlay shrinks
      .to(scanLine, { top: '-2px', opacity: 0.4, duration: 0.8, ease: 'none' })
      .to(overlay, { clipPath: 'circle(0% at 50% 50%)', duration: 0.8, ease: 'power2.inOut' }, '<');

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ ...OVERLAY_BASE }}>
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0a',
          clipPath: 'circle(0% at 50% 50%)',
        }}
      >
        <BrandingText subtitle="LOADING ACHIEVEMENTS" />
        <CrimsonCornerAccents />
        {/* Scan line */}
        <div
          ref={scanLineRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '-2px',
            height: '3px',
            background:
              'linear-gradient(90deg, transparent 0%, #dc143c 20%, #ff4060 50%, #dc143c 80%, transparent 100%)',
            filter: 'drop-shadow(0 0 8px #dc143c) drop-shadow(0 0 16px rgba(220,20,60,0.6))',
            opacity: 0,
            zIndex: 3,
          }}
        />
      </div>
    </div>
  );
}

// ─── Home Orbital Preloader ───────────────────────────────────────────────────
function HomePreloader({ onReady, onDone }: { onReady: () => void; onDone: () => void }) {
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showReady, setShowReady] = useState(false);
  const progressRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneCalledRef = useRef(false);
  const readyCalledRef = useRef(false);

  const triggerReveal = useCallback(() => {
    if (doneCalledRef.current) return;
    const top = topPanelRef.current;
    const bottom = bottomPanelRef.current;
    const content = contentRef.current;
    if (!top || !bottom || !content) {
      if (!readyCalledRef.current) { readyCalledRef.current = true; onReady(); }
      onDone();
      return;
    }

    // Dispatch preloader:done and fire onReady (router.push('/')) exactly when panels START sliding apart
    window.dispatchEvent(new CustomEvent('preloader:done'));
    if (!readyCalledRef.current) {
      readyCalledRef.current = true;
      onReady();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        doneCalledRef.current = true;
        onDone();
      },
    });

    tl.to(content, { opacity: 0, duration: 0.25 })
      .to(top, { y: '-100%', duration: 0.8, ease: 'power2.inOut' }, '-=0.1')
      .to(bottom, { y: '100%', duration: 0.8, ease: 'power2.inOut' }, '<');
  }, [onReady, onDone]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!doneCalledRef.current) {
        window.dispatchEvent(new CustomEvent('preloader:done'));
        if (!readyCalledRef.current) { readyCalledRef.current = true; onReady(); }
        doneCalledRef.current = true;
        onDone();
      }
    }, 8000);

    // Entrance: fade in content
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }

    // Start counter — 100 steps × 25 ms ≈ 2.5 s
    intervalRef.current = setInterval(() => {
      progressRef.current += 1;
      if (progressRef.current >= 100) {
        progressRef.current = 100;
        setProgress(100);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        // Show "SYSTEM READY" after a beat
        setTimeout(() => {
          setShowReady(true);
          // Hold then do sliding-window reveal
          setTimeout(triggerReveal, 500);
        }, 300);
        return;
      }
      setProgress(progressRef.current);
    }, 25);

    return () => {
      clearTimeout(safetyTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circumference = +(2 * Math.PI * 56).toFixed(2);
  const strokeOffset = circumference * (1 - progress / 100);

  return (
    <div style={{ ...OVERLAY_BASE }}>
      {/* Top sliding panel */}
      <div
        ref={topPanelRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '50%',
          background: '#0a0a0a',
          zIndex: 1,
        }}
      />
      {/* Bottom sliding panel */}
      <div
        ref={bottomPanelRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '50%',
          background: '#0a0a0a',
          zIndex: 1,
        }}
      />

      {/* Content layer (above both panels) */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          opacity: 0,
        }}
      >
        {/* Orbital ring */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(130px, 20vw, 190px)',
            height: 'clamp(130px, 20vw, 190px)',
          }}
        >
          <svg
            viewBox="0 0 140 140"
            width="100%"
            height="100%"
            style={{ overflow: 'visible', display: 'block' }}
            aria-hidden="true"
          >
            {/* Concentric HUD circles */}
            <circle
              cx="70" cy="70" r="66"
              fill="none"
              stroke="rgba(220,20,60,0.1)"
              strokeWidth="0.8"
              strokeDasharray="4 6"
            />
            <circle
              cx="70" cy="70" r="62"
              fill="none"
              stroke="rgba(220,20,60,0.07)"
              strokeWidth="0.5"
            />
            <circle
              cx="70" cy="70" r="58"
              fill="none"
              stroke="rgba(220,20,60,0.05)"
              strokeWidth="0.5"
              strokeDasharray="2 8"
            />
            {/* Background ring track */}
            <circle
              cx="70" cy="70" r="56"
              fill="none"
              stroke="rgba(220,20,60,0.12)"
              strokeWidth="4"
            />
            {/* Animated progress ring */}
            <circle
              cx="70" cy="70" r="56"
              fill="none"
              stroke="#dc143c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '70px 70px',
                filter: 'drop-shadow(0 0 6px #dc143c) drop-shadow(0 0 12px rgba(220,20,60,0.5))',
                transition: 'stroke-dashoffset 0.1s linear',
              }}
            />
            {/* Checkmark when done */}
            {showReady && (
              <g>
                <circle
                  cx="70" cy="70" r="22"
                  fill="none"
                  stroke="#dc143c"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 4px #dc143c)' }}
                />
                <path
                  d="M 59 70 L 66 78 L 81 60"
                  fill="none"
                  stroke="#dc143c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 4px #dc143c)' }}
                />
              </g>
            )}
          </svg>

          {/* Percentage counter */}
          {!showReady && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  ...ORBITRON,
                  fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
                  color: '#dc143c',
                  textShadow: '0 0 10px rgba(220,20,60,0.8)',
                }}
              >
                {progress}
                <span style={{ fontSize: '0.6em' }}>%</span>
              </span>
            </div>
          )}
        </div>

        {/* Branding */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              ...ORBITRON,
              fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',
              letterSpacing: '0.15em',
              color: '#ffffff',
              textShadow: '0 0 20px rgba(220,20,60,0.7)',
              marginBottom: '0.5rem',
            }}
          >
            HARSHIT SHAW
          </div>
          <div
            style={{
              ...ORBITRON,
              fontSize: 'clamp(0.5rem, 1.1vw, 0.72rem)',
              letterSpacing: '0.3em',
              color: showReady ? '#dc143c' : 'rgba(220,20,60,0.55)',
              textShadow: showReady ? '0 0 10px rgba(220,20,60,0.9)' : 'none',
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
            }}
          >
            {showReady ? 'SYSTEM READY' : 'INITIALIZING SYSTEMS'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main TransitionOverlay ───────────────────────────────────────────────────
export default function TransitionOverlay() {
  const { currentTransition, fireNavigation, onAnimationEnd } = usePageTransition();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [snapshot, setSnapshot] = useState<TransitionType | null>(null);
  const navigationFiredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When a new transition starts, capture the type and show overlay
  useEffect(() => {
    if (currentTransition && !active) {
      navigationFiredRef.current = false;
      setSnapshot(currentTransition);
      setActive(true);
    }
  }, [currentTransition, active]);

  /** Overlay calls this mid-animation (curtain covers screen) */
  const handleReady = useCallback(() => {
    if (navigationFiredRef.current) return;
    navigationFiredRef.current = true;
    fireNavigation();
  }, [fireNavigation]);

  /** Overlay calls this after reveal is completely done */
  const handleDone = useCallback(() => {
    setActive(false);
    setSnapshot(null);
    onAnimationEnd();
  }, [onAnimationEnd]);

  if (!mounted || !active || !snapshot) return null;

  const curtainProps = { onReady: handleReady, onDone: handleDone };

  const content = (
    <>
      {snapshot === 'contact' && <ContactCurtain {...curtainProps} />}
      {snapshot === 'projects' && <ProjectsCurtain {...curtainProps} />}
      {snapshot === 'work' && <WorkCurtain {...curtainProps} />}
      {snapshot === 'about' && <AboutCurtain {...curtainProps} />}
      {snapshot === 'home' && <HomePreloader onReady={handleReady} onDone={handleDone} />}
    </>
  );

  return createPortal(content, document.body);
}
