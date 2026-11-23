# Brand Identity Report — HS Monogram, Navbar Signature & Favicon

## 1. Files Created and Modified

### Created
- `public/favicon.svg` — static HS monogram favicon for browsers that read `/favicon.svg`
- `src/app/icon.svg` — replaced Next.js App Router icon with HS monogram (served as `/icon.svg`)
- `.agents/tasks/brand-identity-report.md` — this file

### Modified
- `src/components/ui/HSMonogram.tsx` — full redesign: new viewBox, interlocked H+S paths, GSAP animation
- `src/components/ui/Nav.tsx` — branding group restructured; laser divider spec updated; signature sizing and blend mode updated
- `src/app/layout.tsx` — title changed to 'Harshit Shaw - Cloud Engineer' with template, icons metadata added
- `src/app/contact/page.tsx` — title updated to 'Contact' to use layout template

---

## 2. Exact Signature Filename and Path

```
public/assets/signature/harshit-signature.png
```

The original file was not modified. It is referenced from Nav.tsx via Next.js `<Image>` with `unoptimized` to preserve transparency.

---

## 3. HSMonogram SVG Design

### ViewBox
`0 0 60 60`

### Integration Strategy (Option B from the brief)
H sits left (x=5–21), S sits right (x=22–44). The H right vertical ends at x=21; the S curve's leftmost extent reaches approximately x=23–24 at mid-height (around y=25–30). This creates a tight visual meeting point — the S crossbar region nearly touches H's right vertical, giving an interlocked emblem effect without fully merging paths.

### Path Structure

| Element | Type | Description |
|---------|------|-------------|
| H left vertical | `<path>` | `M 5 5 L 5 55` |
| H right vertical | `<path>` | `M 21 5 L 21 55` |
| H crossbar | `<path>` | `M 5 30 L 21 30` |
| S curve | `<path>` | Cubic bezier from (44,12) → arcs left to ~(26.5,16–47.5) → (43.5,35.5) → (24.5,47.5) |

All paths use:
- `stroke="currentColor"` (adapts to dark/light theme)
- `strokeWidth="2.8"`
- `strokeLinecap="round"` / `strokeLinejoin="round"`
- No fill

### Hover
CSS transition on `.hs-monogram-svg`: `drop-shadow(0 0 5px rgba(220,20,60,0.7))` + `scale(1.05)`

---

## 4. GSAP Animation Timeline

1. **Init**: All paths set to `strokeDasharray = strokeDashoffset = pathLength` (fully hidden). SVG opacity = 0.
2. **SVG reveal**: `gsap.set(svg, { opacity: 1 })` immediately.
3. **H left vertical draws** (0.35s, `power2.inOut`): strokeDashoffset → 0.
4. **H right vertical draws** (0.35s, `-=0.2` overlap): strokeDashoffset → 0.
5. **H crossbar draws** (0.22s, `-=0.12` overlap, `power2.out`): strokeDashoffset → 0.
6. **S curve draws** (0.5s, `-=0.38` overlap from crossbar start, `power2.inOut`): strokeDashoffset → 0.
7. **250ms pause** (`+=0.25` delay).
8. **Crimson sweep fade-in** (0.07s): sweep rect opacity → 0.7.
9. **Sweep translate** (0.4s, `power1.inOut`): x from -65 → +70 (left to right across 60px viewBox).
10. **Sweep fade-out** (0.1s, `-=0.1` overlap): opacity → 0.

Total duration: approximately 1.5s. Animation runs once via `animatedRef` guard.

---

## 5. Favicon Filenames and Location

| File | Location | Usage |
|------|----------|-------|
| `favicon.svg` | `public/favicon.svg` | Referenced from layout.tsx metadata `icons.icon` |
| `icon.svg` | `src/app/icon.svg` | Next.js App Router auto-detected icon (served at `/icon.svg`) |

Both are static SVGs: dark circle background (`#0a0a0a`), crimson HS paths (`#dc143c`), no animations.

---

## 6. Browser Title Configuration

Configured in `src/app/layout.tsx` via Next.js `Metadata` export:

```typescript
title: {
  default: 'Harshit Shaw - Cloud Engineer',
  template: '%s | Harshit Shaw',
},
```

Page-specific overrides:
- `src/app/contact/page.tsx`: title `'Contact'` → renders as `Contact | Harshit Shaw`

All other pages (projects, certificates, open-source, etc.) inherit the default: `Harshit Shaw - Cloud Engineer`.

---

## 7. TypeScript and Build Results

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | ✅ Exit 0, no errors |
| Production build | `npm run build` | ✅ Exit 0, 15 static pages generated |

Build warning (pre-existing, not introduced by this change):
```
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images
```
This is a non-blocking warning about the OG image URL resolution.

---

## 8. Known Limitations

- **`favicon.ico`**: The existing `src/app/favicon.ico` (original Next.js default) remains. Next.js prioritizes `favicon.ico` in `app/` for the browser tab icon over the metadata `icons` config in some browsers. To fully replace it, the `favicon.ico` should be regenerated from the SVG. For now, the `icon.svg` route and metadata `icons` config serve the HS favicon in modern browsers.
- **Mix-blend-mode**: The signature uses `mix-blend-mode: multiply` (light theme) and `mix-blend-mode: screen` (dark theme) applied via CSS class selectors on `data-theme`. This works because the theme attribute is set on `<html>` before first paint by the inline script.
- **Animation**: GSAP animation requires client-side JavaScript. Users with JS disabled will see the monogram in its final static state (fully drawn paths, no sweep).
