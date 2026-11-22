'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

export type TransitionType = 'contact' | 'projects' | 'work' | 'about' | 'home';

interface TransitionContextValue {
  /** Call to trigger a curtain animation then navigate */
  navigateTo: (href: string, type: TransitionType) => void;
  /** True while any animation is running */
  isAnimating: boolean;
  /** Which transition is currently active (null when idle) */
  currentTransition: TransitionType | null;
  /** Called by the overlay when the curtain fully covers the screen */
  fireNavigation: () => void;
  /** Called by the overlay after the exit animation is completely done */
  onAnimationEnd: () => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition(): TransitionContextValue {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used within TransitionProvider');
  return ctx;
}

/** Returns the transition type for a given href, or null if no transition applies. */
export function getTransitionType(href: string): TransitionType | null {
  if (href === '/' || href === '/#home' || href === '/home') return 'home';
  if (href === '/contact' || href.endsWith('/contact')) return 'contact';
  if (href === '/projects' || href.endsWith('/projects')) return 'projects';
  if (
    href === '/experience' ||
    href.endsWith('/experience') ||
    href === '/work' ||
    href.endsWith('/work')
  )
    return 'work';
  if (href === '/about' || href.endsWith('/about')) return 'about';
  return null;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAnimatingRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTransition, setCurrentTransition] = useState<TransitionType | null>(null);

  const navigateTo = useCallback(
    (href: string, type: TransitionType) => {
      // Skip animation when user prefers reduced motion
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        router.push(href);
        return;
      }

      // Prevent overlapping animations
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;
      pendingHrefRef.current = href;
      setIsAnimating(true);
      setCurrentTransition(type);
    },
    [router]
  );

  /** Overlay calls this once the curtain fully covers the screen */
  const fireNavigation = useCallback(() => {
    const href = pendingHrefRef.current;
    if (href) {
      pendingHrefRef.current = null;
      router.push(href);
    }
  }, [router]);

  /** Overlay calls this after the reveal/exit animation finishes */
  const onAnimationEnd = useCallback(() => {
    isAnimatingRef.current = false;
    setIsAnimating(false);
    setCurrentTransition(null);
  }, []);

  return (
    <TransitionContext.Provider
      value={{ navigateTo, isAnimating, currentTransition, fireNavigation, onAnimationEnd }}
    >
      {children}
    </TransitionContext.Provider>
  );
}
