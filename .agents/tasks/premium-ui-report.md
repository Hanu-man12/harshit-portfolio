# Premium UI Implementation Report

## 1. Files Created and Modified

### Created
- `src/components/ui/HSMonogram.tsx` — animated SVG HS monogram component

### Modified
- `src/components/hero/HeroSection.tsx` — letter-hover implementation
- `src/components/ui/Nav.tsx` — HSMonogram, signature, underline, hover styles
- `src/components/ui/ThemeToggle.tsx` — cinematic View Transitions API theme switch
- `src/app/globals.css` — `.hero-letter` hover styles, View Transitions keyframes

## 2. Animation Libraries Used

- **GSAP 3.15.1** — HSMonogram stroke-dashoffset draw timeline
- **motion (Framer Motion) 14.14.0** — existing ThemeToggle icon animation (preserved)
- **CSS transitions** — hero letter hover (transform + color), nav underline (scaleX)

## 3. Exact Signature Filename and Path

```
public/assets/signature/harshit-signature.png
```

Displayed with CSS filter `sepia(1) saturate(10) hue-rotate(310deg) brightness(0.85)` to achieve crimson color without modifying the original file. `mix-blend-mode: multiply` removes any white background. Rotated 65 degrees clockwise via `transform: rotate(65deg)`. Hidden on mobile (below `md` breakpoint).

## 4. HSMonogram Animation (SVG paths + timeline)

**H letterform** — single continuous SVG path with two vertical strokes and a crossbar:
```
M 4 4 L 4 32  (left vertical)
M 4 18 L 18 18  (crossbar)
M 18 4 L 18 32  (right vertical)
```
Stroke color uses `currentColor` (inherits theme `--text` via CSS).

**S letterform** — cubic bezier curve from top-right, sweeping left and back:
```
M 39 8 C 39 5 36 4 32 4 C 26 4 24 7 24 11 C 24 15 27 17 32 18 C 37 19 40 21 40 25 C 40 29 38 32 32 32 C 27 32 24 30 24 28
```
Stroke color is `var(--accent)` (crimson).

**Timeline (GSAP)**:
1. Measure real path lengths via `getTotalLength()`.
2. Set `strokeDasharray` = path length, `strokeDashoffset` = path length (fully hidden).
3. Animate H: `strokeDashoffset` → 0 over 0.65s (`power2.inOut`).
4. Overlap S draw by 0.47s, same duration.
5. After 0.18s pause, fade in a linear-gradient rect (crimson shine) and translate it from x=-44 to x=44 over 0.45s, then fade out.

**Ref guard** (`animatedRef`) prevents re-triggering on React re-renders or navigation.

**Hover**: CSS `drop-shadow(0 0 6px var(--accent-glow))` + `scale(1.08)` on the SVG element.

## 5. Theme Transition (technique and rationale)

**Technique: View Transitions API** (`document.startViewTransition`).

**Why**: The theme is controlled via `data-theme` on `<html>` — the simplest pattern for View Transitions. The browser automatically snapshots old and new states; the new root appears as `::view-transition-new(root)` and the animation runs in CSS.

**Mechanism**:
1. On toggle click, capture button center coordinates via `getBoundingClientRect()`.
2. Set `--vt-cx` and `--vt-cy` CSS custom properties on `:root`.
3. Call `document.startViewTransition(() => applyTheme())`.
4. CSS `@keyframes theme-reveal` animates `clip-path: circle(0% at var(--vt-cx) var(--vt-cy))` → `circle(150% at ...)` on `::view-transition-new(root)` over 0.5s.
5. `prefers-reduced-motion: reduce` skips the animation (both pseudo-elements get `animation: none`).
6. Browsers without `startViewTransition` fall through to instant theme swap (graceful degradation).

**localStorage persistence** is unchanged — `toggle()` still writes to `localStorage` and sets the attribute.

## 6. Letter-Hover Without Breaking Scramble

The scramble animation operates by directly setting `el.textContent` on the `<h1>` ref every 50ms, which wipes any child elements. Wrapping letters in `<span>` elements *before* the scramble would be destroyed on the first tick.

**Solution**: The `buildLetterSpans()` function runs *at the end* of the scramble — specifically in the `clearInterval(anim)` branch when `frame > total`. At that point the scramble has written the final clean text, and `buildLetterSpans()` replaces `textContent` with individually-wrapped `<span class="hero-letter">` elements.

The reduced-motion path (`nameRef.current.style.opacity = '1'`) preserves plain text with no spans — hover CSS on `.hero-letter` is irrelevant since those spans never exist in that path.

## 7. TypeScript and Build Results

```
npx tsc --noEmit   → exit 0 (no errors)
npm run build      → exit 0 (all 15 pages generated, 2 warnings about metadataBase — pre-existing)
```

## 8. Untouched Files

- `src/components/preloader/PreLoader.tsx` — not modified
- `src/components/transitions/TransitionContext.tsx` — not modified
- `src/components/transitions/TransitionOverlay.tsx` — not modified
- All files under `src/data/` — not modified
- Footer — not modified
- All section content components (About, Projects, Work, Contact, Skills, etc.) — not modified

The curtain page-transition system (`usePageTransition` / `navigateTo`) is preserved in full — `Nav.tsx` still calls `handleNavClick` → `navigateTo` exactly as before.

## 9. Known Limitations

- **View Transitions clip-path origin**: The `--vt-cx`/`--vt-cy` CSS custom properties are set on `:root` immediately before `startViewTransition`. This works in Chrome/Edge 111+ and Safari 18+. Firefox (as of this writing) has limited VT support; the instant fallback is used there.
- **H letterform path**: Uses three disconnected subpaths in one `<path>` element. The `getTotalLength()` measurement covers the full compound path, which means the dashoffset draw animation draws all three subpaths roughly simultaneously (not sequentially). This is intentional for the compact animation.
- **Signature on dark theme**: `mix-blend-mode: multiply` works best on light backgrounds; on dark backgrounds the signature may appear slightly less opaque. `opacity: 0.75` compensates for this, keeping it legible but subtle on both themes.
- **metadataBase warnings**: Two pre-existing Next.js build warnings about `metadataBase` — not introduced by this implementation.
