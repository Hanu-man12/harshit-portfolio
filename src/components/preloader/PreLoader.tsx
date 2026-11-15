'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import type { Texture } from 'three';
import { useReducedMotion } from '@/lib/useReducedMotion';

const RedOrbitScene = dynamic(() => import('./RedOrbitScene'), {
  ssr: false,
  loading: () => null,
});

type AssetState = 'loading' | 'ready' | 'failed';

function StaticPlanet() {
  return (
    <>
      <div className="red-orbit-fallback-ring" aria-hidden="true" />
      <div className="red-orbit-fallback-planet" aria-hidden="true" />
    </>
  );
}

export default function PreLoader() {
  const [visible, setVisible] = useState(true);
  const [texture, setTexture] = useState<Texture | null>(null);
  const [assetState, setAssetState] = useState<AssetState>('loading');
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !visible) {
      setVisible(false);
      return;
    }

    const canvas = document.createElement('canvas');
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    } catch {
      context = null;
    }
    const supported = Boolean(context);
    setWebglSupported(supported);
    context?.getExtension('WEBGL_lose_context')?.loseContext();

    const media = window.matchMedia('(max-width: 640px)');
    const updateMobile = () => setMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const markPageReady = () => setPageReady(true);
    if (document.readyState === 'complete') markPageReady();
    else window.addEventListener('load', markPageReady, { once: true });

    const fallbackTimer = window.setTimeout(() => {
      setAssetState((current) => current === 'loading' ? 'failed' : current);
      setPageReady(true);
    }, 8000);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('load', markPageReady);
      media.removeEventListener('change', updateMobile);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduced, visible]);

  useEffect(() => {
    if (!visible || reduced || webglSupported === null) return;
    if (!webglSupported) {
      setAssetState('failed');
      return;
    }

    let cancelled = false;
    let loadedTexture: Texture | null = null;
    import('three').then(({ TextureLoader, SRGBColorSpace }) => {
      if (cancelled) return;
      new TextureLoader().load(
        '/images/preloader/mars-2k.jpg',
        (loaded) => {
          loaded.colorSpace = SRGBColorSpace;
          loadedTexture = loaded;
          if (cancelled) {
            loaded.dispose();
            return;
          }
          setTexture(loaded);
          setAssetState('ready');
        },
        undefined,
        () => {
          if (!cancelled) setAssetState('failed');
        },
      );
    }).catch(() => setAssetState('failed'));

    return () => {
      cancelled = true;
      loadedTexture?.dispose();
    };
  }, [visible, reduced, webglSupported]);

  useEffect(() => {
    if (!visible || reduced) return;
    const context = gsap.context(() => {
      gsap.set(sceneRef.current, { autoAlpha: 0, scale: 0.9 });
      gsap.set(titleRef.current?.querySelectorAll('[data-name-letter]') ?? [], { autoAlpha: 0, y: 22 });
      gsap.set(statusRef.current, { autoAlpha: 0, y: 8 });
      gsap.set(indicatorRef.current, { scaleX: 0.08, transformOrigin: 'left center' });

      gsap.timeline({ onComplete: () => setIntroReady(true) })
        .to(sceneRef.current, { autoAlpha: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, 0.08)
        .to(titleRef.current?.querySelectorAll('[data-name-letter]') ?? [], {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.055,
          ease: 'power2.out',
        }, 0.55)
        .to(statusRef.current, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.35)
        .to(indicatorRef.current, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 1.5)
        .to({}, { duration: 0.45 }, 2.5);
    }, containerRef);
    return () => context.revert();
  }, [visible, reduced]);

  useEffect(() => {
    if (!visible || reduced || !introReady || !pageReady || assetState === 'loading') return;
    const context = gsap.context(() => {
      gsap.timeline({ onComplete: () => setVisible(false) })
        .to(sweepRef.current, { xPercent: 150, opacity: 0.7, duration: 0.48, ease: 'power2.inOut' })
        .to(containerRef.current, { autoAlpha: 0, duration: 0.58, ease: 'power2.inOut' }, 0.22);
    }, containerRef);
    return () => context.revert();
  }, [visible, reduced, introReady, pageReady, assetState]);

  if (!visible || reduced) return null;

  const displayName = 'HARSHIT SHAW';
  const status = assetState === 'loading' || !pageReady ? 'INITIALIZING PORTFOLIO...' : 'SYSTEM READY';

  return (
    <div ref={containerRef} className="red-orbit-preloader fixed inset-0 z-[9999] isolate overflow-hidden" role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="red-orbit-nebula" aria-hidden="true" />
      <div ref={sceneRef} className="red-orbit-scene absolute inset-0" aria-hidden="true">
        {webglSupported
          ? <RedOrbitScene texture={assetState === 'ready' ? texture : null} mobile={mobile} />
          : <StaticPlanet />}
      </div>

      <div className="red-orbit-copy absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-6 text-center md:pl-[8vw] md:text-left">
          <h1 ref={titleRef} aria-label={displayName} className="red-orbit-title whitespace-nowrap font-display leading-[0.9]" style={{fontFamily: 'var(--font-display)'}}>
            {'HARSHIT'.split('').map((letter, index) => (
              <span data-name-letter key={`harshit-${index}`} className="inline-block text-[var(--loader-text)]">{letter}</span>
            ))}
            <span className="inline-block w-[0.2em]" aria-hidden="true"> </span>
            {'SHAW'.split('').map((letter, index) => (
              <span data-name-letter key={`shaw-${index}`} className="inline-block text-[var(--accent)]">{letter}</span>
            ))}
          </h1>
          <p ref={statusRef} className="mt-5 flex items-center justify-center gap-3 text-[0.65rem] tracking-[0.25em] text-[var(--loader-muted)] md:justify-start md:text-xs" style={{fontFamily: 'var(--font-mono)'}}>
            <span className={`red-orbit-status-dot ${assetState === 'ready' && pageReady ? 'is-ready' : ''}`} aria-hidden="true" />
            {status}
          </p>
          <div className="mt-4 h-px w-36 overflow-hidden bg-[var(--loader-track)] md:w-48" aria-hidden="true">
            <span ref={indicatorRef} className="red-orbit-progress block h-full w-full bg-[var(--accent)]" />
          </div>
        </div>
      </div>
      <div ref={sweepRef} className="red-orbit-light-sweep pointer-events-none absolute inset-y-0 left-[-45%] z-20 w-[35%]" aria-hidden="true" />
    </div>
  );
}
