# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript web component that swaps video sources and poster images based on viewport width to optimize bandwidth usage. The component wraps a `<video>` element and manages its `src` and `poster` attributes dynamically, ensuring mobile users only download mobile assets and desktop users only download desktop assets.

## Development Commands

### Build and Development
```bash
npm run build          # Production build (ESM, CJS, UMD, minified UMD)
npm run dev            # Start dev server on port 3006 with live reload
npm run serve          # Alias for dev
```

### Code Quality
```bash
npm run lint           # Lint src/ and rollup.config.mjs with ESLint
npm run format         # Format all files with Prettier
```

### Publishing
```bash
npm run prepublishOnly # Automatically runs build before publishing
```

## Architecture

### Core Component Structure

The entire component is defined in a single file: `src/responsive-video.js`

**`ResponsiveVideo` class** extends `HTMLElement` and uses:
- Private class fields (`#videoEl`, `#currentSrc`, `#resizeRaf`, `#boundResize`) for encapsulation
- Custom Elements lifecycle: `connectedCallback()`, `disconnectedCallback()`
- No observed attributes—attributes are read once on connect and on resize only

**Key behaviors:**
1. On connect: queries for child `<video>` element, attaches window resize listener, evaluates initial source
2. On resize: throttles updates via `requestAnimationFrame`, only swaps source when URL actually changes
3. On disconnect: removes listeners, cancels pending animation frames

**Source selection logic** (see `updateSource()` in `src/responsive-video.js:62`):
- Compares `window.innerWidth` against `breakpoint` attribute (defaults to 768)
- If viewport ≥ breakpoint → `desktop-video` and `desktop-poster`
- If viewport < breakpoint → `mobile-video` and `mobile-poster`
- If `mobile-video` is missing → falls back to `desktop-video`
- Poster attributes are optional and managed alongside video sources
- Sets `data-active-mode` attribute to "mobile" or "desktop"

**Performance optimizations:**
- Private `#currentSrc` field prevents redundant updates (line 100: `if (nextVideo === this.#currentSrc) return;`)
- Resize handler uses `requestAnimationFrame` throttling
- Event listeners use `{ passive: true }`
- Component bails early if no `<video>` element exists

**Supported attributes:**
- `mobile-video`: Video URL for mobile viewports
- `desktop-video`: Video URL for desktop viewports
- `mobile-poster`: Poster image URL for mobile viewports (optional)
- `desktop-poster`: Poster image URL for desktop viewports (optional)
- `breakpoint`: Viewport width threshold (defaults to 768px)

### Build System

**Rollup configuration** (`rollup.config.mjs`) generates four output formats:
1. ESM: `dist/responsive-video.esm.js` (with sourcemap)
2. CJS: `dist/responsive-video.cjs.js` (with sourcemap)
3. UMD: `dist/responsive-video.js` (with sourcemap)
4. Minified UMD: `dist/responsive-video.min.js` (no sourcemap, terser plugin)

**Dev mode** (`npm run dev`):
- Enables watch mode via `ROLLUP_WATCH` env var
- Serves `dist/` and `demo/` on port 3006
- Automatically copies built files to `demo/` directory
- Opens browser automatically

### Demo Structure

The `demo/` folder contains:
- `index.html`: Example usage with styling and CDN-hosted video URLs
- Build artifacts copied during dev (`.esm.js` and `.esm.js.map`)

Note: The demo uses external CDN URLs (Pixabay) for video sources to avoid committing large files to the repository.

### Publishing Configuration

Package exports both `dist/` and `src/` directories (see `package.json:35-38`).

The `package.json` defines multiple entry points:
- `main`: CJS bundle
- `module`: ESM bundle
- `unpkg`: Minified UMD bundle
- `exports`: Modern Node.js conditional exports

## Code Patterns

### Making Changes to the Component

When modifying `src/responsive-video.js`:
1. The source file is vanilla ES2022+ JavaScript with private class fields
2. Always test with `npm run dev` to see changes in the demo
3. Run `npm run lint` before committing
4. Maintain the performance patterns (RAF throttling, passive listeners, early bailouts, source deduplication)
5. The component does NOT use `observedAttributes`—attributes are read dynamically on connect and resize

### Adding New Features

If adding configurable behavior via attributes:
1. Read attribute value in `updateSource()` or relevant method using `this.getAttribute()`
2. Validate and provide sensible defaults (see `#getBreakpoint()` at line 107 for pattern)
3. Pass values through to `#applySource()` if they affect video element attributes
4. Update README.md API documentation

Note: Attributes are expected to be static HTML attributes, not dynamically changed via JavaScript

### Testing Changes

No formal test suite exists. Test manually by:
1. Running `npm run dev`
2. Opening browser to `localhost:3006`
3. Resizing viewport to cross the breakpoint
4. Checking network tab to confirm only one video loads (and one poster if provided)
5. Verifying `data-active-mode` attribute updates correctly
6. Inspecting the `<video>` element to confirm both `src` and `poster` attributes swap correctly
