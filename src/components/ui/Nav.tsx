'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import HSMonogram from './HSMonogram';
import { usePageTransition, getTransitionType } from '@/components/transitions/TransitionContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Achievements', href: '/certificates' },
  { label: 'Open Source', href: '/open-source' },
  { label: 'Contact', href: '/contact' },
];

// Visual clone of Button primary sm — avoids prop-type conflicts with the shared Button component
const connectBtnClass =
  'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] px-3 py-1.5 text-sm bg-[var(--accent)] text-white hover:opacity-90';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { navigateTo } = usePageTransition();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function handleResize() {
      if (window.innerWidth >= 900) setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const type = getTransitionType(href);
    if (type) {
      e.preventDefault();
      setOpen(false);
      navigateTo(href, type);
    } else {
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[4.25rem] sm:h-[4.5rem]">
        {/* Left branding: HS monogram + laser divider + signature */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigateTo('/', 'home'); }}
          aria-label="Harshit Shaw — home"
          className="hs-brand-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}
        >
          {/* Animated HS Monogram */}
          <HSMonogram />

          {/* Vertical laser divider */}
          <div
            aria-hidden="true"
            style={{
              width: '1.5px',
              height: 'clamp(24px, 3.5vw, 36px)',
              background: '#dc143c',
              boxShadow: '0 0 6px 1px rgba(220,38,38,0.7), 0 0 12px 2px rgba(220,38,38,0.35)',
              borderRadius: '1px',
              flexShrink: 0,
            }}
          />

          {/* Signature — always visible, responsive sizing */}
          <Image
            src="/assets/signature/harshit-signature.png"
            alt="Harshit Shaw signature"
            width={120}
            height={60}
            style={{
              filter:
                'brightness(0) saturate(100%) invert(13%) sepia(95%) saturate(600%) hue-rotate(328deg) brightness(1.1)',
              objectFit: 'contain',
              height: 'clamp(28px, 4vw, 48px)',
              width: 'auto',
              display: 'block',
              flexShrink: 0,
            }}
            className="hs-sig-img"
            priority={false}
            unoptimized
          />
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden min-[900px]:flex items-center gap-3 lg:gap-4 xl:gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`nav-link relative whitespace-nowrap py-2 text-base font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                isActive(link.href)
                  ? 'text-[var(--accent)] nav-link--active'
                  : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {link.label}
              <span
                className="nav-underline"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: isActive(link.href) ? '2px' : '1px',
                  background: 'var(--accent)',
                  transform: isActive(link.href) ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left center',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  opacity: isActive(link.href) ? 1 : 0.7,
                }}
              />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden min-[900px]:flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/contact"
            onClick={(e) => handleNavClick(e, '/contact')}
            className={connectBtnClass}
          >
            Let&apos;s Connect
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="flex min-[900px]:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 min-h-[calc(100dvh-4.25rem)] max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:min-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100dvh-4.5rem)] min-[900px]:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 sm:py-5">
              {NAV_LINKS.map(link => {
                const active = isActive(link.href);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 w-full items-center justify-center rounded-sm border-l-2 px-4 text-center font-display text-2xl font-semibold uppercase tracking-wider transition-colors duration-200 sm:text-3xl cursor-pointer ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'border-transparent text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/contact"
                onClick={(e) => handleNavClick(e, '/contact')}
                className={`mt-3 min-h-11 w-full ${connectBtnClass}`}
              >
                Let&apos;s Connect
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Nav underline hover styles + signature blend mode */}
      <style>{`
        .nav-link:hover .nav-underline {
          transform: scaleX(1) !important;
          opacity: 0.7 !important;
        }
        .nav-link--active .nav-underline {
          transform: scaleX(1) !important;
          height: 2px !important;
          opacity: 1 !important;
        }
        .hs-brand-link {
          cursor: pointer;
          text-decoration: none;
        }
        .hs-brand-link:hover .hs-monogram-svg {
          filter: drop-shadow(0 0 5px rgba(220, 20, 60, 0.7));
          transform: scale(1.05);
        }
        [data-theme="light"] .hs-sig-img {
          mix-blend-mode: multiply;
        }
        [data-theme="dark"] .hs-sig-img {
          mix-blend-mode: screen;
        }
        @media (max-width: 899px) {
          .hs-sig-img {
            height: clamp(22px, 5vw, 32px) !important;
          }
        }
      `}</style>
    </header>
  );
}
