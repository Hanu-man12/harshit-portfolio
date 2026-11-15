'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import gsap from 'gsap';
import type { Texture } from 'three';
import { useReducedMotion } from '@/lib/useReducedMotion';

const RedOrbitScene = dynamic(() => import('./RedOrbitScene'), {
  ssr: false,
  loading: () => null,
});

type AssetState = 'loading' | 'ready' | 'failed';
type PreloaderStage = 'initializing' | 'ready';

function StaticPlanet() {
  return (
    <div className="red-orbit-fallback-planet" aria-hidden="true" />
  );
}

export default function PreLoader() {
  const [visible, setVisible] = useState(true);
  const [texture, setTexture] = useState<Texture | null>(null);
  const [assetState, setAssetState] = useState<AssetState>('loading');
  const [textureProgress, setTextureProgress] = useState(0);
  const [backgroundState, setBackgroundState] = useState<AssetState>('loading');
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [stage, setStage] = useState<PreloaderStage>('initializing');
  const [readyStageComplete, setReadyStageComplete] = useState(false);
  const startedAtRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const sceneSettled = sceneReady || loadTimedOut;
  const resourcesReady = backgroundState !== 'loading'
    && assetState !== 'loading'
    && sceneSettled
    && pageReady;
  const progress = resourcesReady && stage === 'ready'
    ? 100
    : Math.max(1, Math.min(99, Math.floor(
      (backgroundState === 'loading' ? 0 : 20)
      + (assetState === 'loading' ? textureProgress * 0.55 : 55)
      + (sceneSettled ? 15 : 0)
      + (pageReady ? 10 : 0),
    )));

  useEffect(() => {
    if (reduced || !visible) {
      setVisible(false);
      return;
    }

    if (startedAtRef.current === 0) startedAtRef.current = Date.now();

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
    if (!supported) {
      setAssetState('failed');
      setSceneReady(true);
    }

    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const markPageReady = () => setPageReady(true);
    if (document.readyState === 'complete') markPageReady();
    else window.addEventListener('load', markPageReady, { once: true });

    const fallbackTimer = window.setTimeout(() => {
      setBackgroundState((current) => current === 'loading' ? 'failed' : current);
      setAssetState((current) => current === 'loading' ? 'failed' : current);
      setLoadTimedOut(true);
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
          setTextureProgress(100);
          setAssetState('ready');
        },
        (event) => {
          if (!cancelled && event.total > 0) {
            setTextureProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          }
        },
        () => {
          if (!cancelled) {
            setTextureProgress(100);
            setAssetState('failed');
          }
        },
      );
    }).catch(() => {
      if (!cancelled) {
        setTextureProgress(100);
        setAssetState('failed');
      }
    });

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
      gsap.set(indicatorRef.current, { autoAlpha: 0 });

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
        .to(indicatorRef.current, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 1.5)
        .to({}, { duration: 0.45 }, 2.5);
    }, containerRef);
    return () => context.revert();
  }, [visible, reduced]);

  useEffect(() => {
    if (!visible || reduced || !introReady || !resourcesReady || stage !== 'ready' || !readyStageComplete) return;
    const context = gsap.context(() => {
      gsap.timeline({ onComplete: () => setVisible(false) })
        .to(sweepRef.current, { xPercent: 150, opacity: 0.7, duration: 0.48, ease: 'power2.inOut' })
        .to(containerRef.current, { autoAlpha: 0, duration: 0.58, ease: 'power2.inOut' }, 0.22);
    }, containerRef);
    return () => context.revert();
  }, [visible, reduced, introReady, resourcesReady, stage, readyStageComplete]);

  useEffect(() => {
    if (!visible || reduced || !resourcesReady || stage !== 'initializing') return;
    const elapsed = startedAtRef.current === 0 ? 0 : Date.now() - startedAtRef.current;
    const remaining = Math.max(0, 1500 - elapsed);
    const timer = window.setTimeout(() => setStage('ready'), remaining);
    return () => window.clearTimeout(timer);
  }, [visible, reduced, resourcesReady, stage]);

  useEffect(() => {
    if (!visible || reduced || stage !== 'ready') return;
    const timer = window.setTimeout(() => setReadyStageComplete(true), 1700);
    return () => window.clearTimeout(timer);
  }, [visible, reduced, stage]);

  if (!visible || reduced) return null;

  const displayName = 'HARSHIT SHAW';
  const usingFallback = backgroundState === 'failed' || assetState === 'failed' || !webglSupported || loadTimedOut;
  const status = stage === 'ready'
    ? (usingFallback ? 'SYSTEM READY · FALLBACK MODE' : 'SYSTEM READY')
    : 'INITIALIZING PORTFOLIO...';

  return (
    <div ref={containerRef} className="red-orbit-preloader fixed inset-0 z-[9999] isolate overflow-hidden" role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="red-orbit-landscape absolute inset-0" aria-hidden="true">
        <Image
          src="/images/preloader/red-orbit-scene.png"
          alt=""
          fill
          sizes="100vw"
          unoptimized
          draggable={false}
          onLoad={() => setBackgroundState('ready')}
          onError={() => setBackgroundState('failed')}
        />
      </div>
      <div className="red-orbit-nebula" aria-hidden="true" />
      <div className="red-orbit-shade absolute inset-0" aria-hidden="true" />
      <div ref={sceneRef} className="red-orbit-scene absolute inset-0" aria-hidden="true">
        {!webglSupported || !sceneReady ? <StaticPlanet /> : null}
        {webglSupported && (
          <RedOrbitScene
            texture={assetState === 'ready' ? texture : null}
            mobile={mobile}
            onReady={onSceneReady}
          />
        )}
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
          <p ref={statusRef} className="red-orbit-status mt-5 flex items-center justify-center gap-3 text-[0.65rem] tracking-[0.25em] text-[var(--loader-muted)] md:justify-start md:text-xs" style={{fontFamily: 'var(--font-mono)'}}>
            <span className={`red-orbit-status-dot ${stage === 'ready' ? 'is-ready' : ''}`} aria-hidden="true" />
            {status}
          </p>
          <div className="red-orbit-loader-group mt-5">
            <div
              className="red-orbit-primary-track"
              role="progressbar"
              aria-label="Portfolio resources loaded"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span ref={indicatorRef} className="red-orbit-progress block h-full" style={{width: `${progress}%`}} />
            </div>
            <div className="red-orbit-secondary-row">
              <span className="red-orbit-secondary-label" style={{fontFamily: 'var(--font-mono)'}}>
                {stage === 'ready' ? 'RESOURCES READY' : 'LOADING ASSETS'}
              </span>
              <div className="red-orbit-percent-loader" aria-hidden="true">
                <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle className="red-orbit-percent-track" cx="22" cy="22" r="18" fill="none" strokeWidth="2" />
                  <circle
                    className="red-orbit-percent-value"
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    strokeWidth="2.5"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - progress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="red-orbit-percent" style={{fontFamily: 'var(--font-mono)'}}>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={sweepRef} className="red-orbit-light-sweep pointer-events-none absolute inset-y-0 left-[-45%] z-20 w-[35%]" aria-hidden="true" />
    </div>
  );
}
