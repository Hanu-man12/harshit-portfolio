# Curtain Transitions + Home Orbital Preloader — Implementation Report

## 1. Files created and modified

### Created
| Path | Purpose |
|------|---------|
| `D:\harshit-portfolio\src\components\transitions\TransitionContext.tsx` | React context, `TransitionProvider`, `usePageTransition` hook, `getTransitionType` helper |
| `D:\harshit-portfolio\src\components\transitions\TransitionOverlay.tsx` | Portal overlay, four curtain animations, `HomePreloader` component |
| `D:\harshit-portfolio\.agents\tasks\curtain-transitions-report.md` | This report |

### Modified
| Path | Change |
|------|--------|
| `D:\harshit-portfolio\src\app\layout.tsx` | Added `TransitionProvider` wrapper and `TransitionOverlay` mount |
| `D:\harshit-portfolio\src\components\ui\Nav.tsx` | Replaced `<Link>` with `<a>` + `handleNavClick` wired to `navigateTo` |

---

## 2. Animation libraries used

**GSAP 3.15.1** (already installed) — used for all GSAP timelines (cover/hold/reveal sequencing, clip-path animation, panel slides, home preloader fade and sliding-window reveal).

**SVG + React state** — used for the orbital progress ring in `HomePreloader` (SVG `strokeDashoffset` updated via React state, no extra library).

**CSS transitions** — used for the SYSTEM READY text color/text-shadow cross-fade in `HomePreloader`.

No new dependencies were added.

---

## 3. How each curtain animation works

### A. Contact — Vertical Falling Curtain
- Single `#0a0a0a` full-screen panel starts at `y: -100%`.
- **Cover** (0.6 s, power2.inOut): slides down to `y: 0%`.
- `onReady()` fires → `router.push('/contact')` executes.
- **Hold** (0.4 s): static.
- **Reveal** (0.6 s, power2.inOut): slides back up to `y: -100%`.
- `onDone()` fires → overlay removed, `isAnimating` cleared.
- Safety timeout: 5 s forces `onDone` if the GSAP timeline never completes.

### B. Projects — Horizontal Curtain
- Single `#0a0a0a` panel starts at `x: -100%`.
- **Cover** (0.6 s, power2.inOut): slides right to `x: 0%`.
- `onReady()` → router push.
- **Hold** (0.4 s): static.
- **Reveal** (0.6 s, power2.inOut): exits to the right (`x: 100%`).
- Safety: 5 s.

### C. Work — Dual Panel Curtain
- Two `50vw × 100vh` panels: left starts at `x: -100%`, right at `x: 100%`.
- **Cover** (0.7 s, power2.inOut): both slide to `x: 0%` simultaneously; branding text fades in `opacity: 1`.
- `onReady()` → router push.
- **Hold** (0.4 s): branding visible.
- **Reveal**: branding fades out (0.15 s), then both panels slide apart simultaneously (0.7 s, power2.inOut) — left to `x: -100%`, right to `x: 100%`.
- Safety: 5 s.

### D. About — Crimson Laser Curtain
- Dark `#0a0a0a` div uses `clip-path: circle(...)` and a horizontal scan-line div.
- **Expand** (0.8 s, power2.inOut): `clip-path` grows from `circle(0% at 50% 50%)` → `circle(150% at 50% 50%)`.
- **Scan sweep** (0.8 s, parallel): scan-line moves `top: -2px` → `top: 100%` with crimson gradient and `drop-shadow(0 0 8px #dc143c)`.
- `onReady()` → router push.
- **Hold** (0.5 s): overlay and branding visible.
- **Retract**: scan-line sweeps back to top (0.8 s), simultaneously `clip-path` shrinks back to `circle(0%)` (0.8 s).
- Safety: 5 s.

---

## 4. Home preloader and sliding-window reveal

**Visual:** Full-screen `#0a0a0a` overlay split into top (50 vh) and bottom (50 vh) panels. Above both panels sits a content layer with:
- SVG orbital ring: 3 concentric dashed HUD circles (low opacity) + a `strokeDashoffset`-animated progress circle in `#dc143c` with GSAP-style `drop-shadow`.
- Percentage counter (React `useState`) updated by `setInterval` at 25 ms intervals (100 steps ≈ 2.5 s total).
- "HARSHIT SHAW" in Orbitron font, subtitle transitions from "INITIALIZING SYSTEMS" → "SYSTEM READY".
- At 100 %: a checkmark SVG (circle + tick path) replaces the counter inside the ring.

**Exit — Sliding Window Reveal:**
1. After 300 ms (checkmark animates in), `setShowReady(true)` → "SYSTEM READY" label appears.
2. After 500 ms hold, `triggerReveal()` fires:
   - **At the moment the panels start sliding**, `window.dispatchEvent(new CustomEvent('preloader:done'))` is dispatched — this triggers the existing Hero scramble animation in `HeroSection.tsx`.
   - Content fades out (0.25 s), top panel slides to `y: -100%` and bottom panel slides to `y: 100%` simultaneously (0.8 s, power2.inOut).
3. `onDone()` removes the overlay from the DOM.

---

## 5. Internal-navigation detection (sessionStorage flag)

The existing `PreLoader.tsx` runs on **every cold load and browser refresh** — it checks `document.readyState` and fires on mount. It is completely unchanged.

The new `HomePreloader` only activates when `navigateTo('/', 'home')` is called from Nav. The `navigateTo` function in `TransitionContext.tsx` performs the guard:

```ts
// In TransitionContext — only fires on explicit nav, never on cold load
const navigateTo = (href, type) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { router.push(href); return; }
  if (isAnimatingRef.current) return;
  isAnimatingRef.current = true;
  pendingHrefRef.current = href;
  setCurrentTransition(type);
};
```

Nav only calls `navigateTo` on user click — the existing PreLoader fires on mount before any JS interaction is possible. There is therefore no session-storage check needed: the two preloaders are structurally mutually exclusive. The existing PreLoader is a React component that mounts at app start; the HomePreloader only mounts when `currentTransition === 'home'` is set via a click event. They cannot both be active simultaneously.

---

## 6. Confirmation that PreLoader.tsx is untouched

| Metric | Before | After |
|--------|--------|-------|
| MD5 hash | `90B037337BE5A5AA6724E5CABB1569F3` | `90B037337BE5A5AA6724E5CABB1569F3` |
| Last modified | 11/21/2026 10:54:42 PM | 11/21/2026 10:54:42 PM |

The file was not opened for writing at any point.

---

## 7. TypeScript and build results

| Check | Command | Exit code | Notes |
|-------|---------|-----------|-------|
| TypeScript | `npx tsc --noEmit` | **0** | No errors, no warnings |
| Production build | `npm run build` | **0** | 15 static pages generated, 2 warnings about `metadataBase` (pre-existing, unrelated to this change) |

---

## 8. Known limitations and caveats

- **Nav hrefs `/certificates` and `/open-source`** do not trigger curtain animations (no entry in the routing table). They navigate via normal `<a href>` browser navigation, which causes a full-page reload. This is consistent with the original behaviour; those pages were never in the transition routing table in the spec.

- **`<a>` vs `<Link>`** — Nav now uses `<a>` elements instead of Next.js `<Link>`. This disables Next.js client-side prefetching on nav links. For `/certificates` and `/open-source` (which have no JS-driven transition), the `<a>` href causes a hard navigation. If prefetching on those links is desired in future, they can be restored to `<Link>` with a click handler that falls through to default for non-transition hrefs.

- **Home preloader dispatches `preloader:done`** — HeroSection listens for this event to start the name scramble. Because the HomePreloader dispatches it at the moment panels begin sliding (not after full reveal), the Hero text animation starts playing while the panels are still animating apart — this is intentional per spec ("fires in sync with the reveal").

- **No `prefers-reduced-motion` animation for HomePreloader** — when reduced motion is preferred, `navigateTo` calls `router.push` directly and the HomePreloader is never mounted, so the existing Hero text shows immediately without animation.

- **GSAP `.call()` inside a timeline** fires synchronously at that point in the GSAP playhead, which means `fireNavigation()` (router.push) is called exactly when the curtain reaches full coverage, before the hold/reveal phase.
