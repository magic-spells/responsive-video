# @magic-spells/responsive-video

[![npm version](https://img.shields.io/npm/v/@magic-spells/responsive-video.svg)](https://www.npmjs.com/package/@magic-spells/responsive-video)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@magic-spells/responsive-video)](https://bundlephobia.com/package/@magic-spells/responsive-video)
[![license](https://img.shields.io/npm/l/@magic-spells/responsive-video.svg)](https://github.com/magic-spells/responsive-video/blob/main/LICENSE)

A lightweight, zero-dependency web component that intelligently swaps video sources and poster images based on viewport width. Built for performance-critical hero sections and modern web applications where mobile users should never download desktop assets (and vice versa).

**[Live Demo](https://magic-spells.github.io/responsive-video/demo/)**

## Why This Exists

Traditional responsive video implementations using `<source>` tags with media queries load multiple sources, wasting bandwidth and degrading performance on mobile devices. This component solves that by:

- **Loading only what's needed**: Mobile users download only mobile videos and posters, desktop users get desktop assets
- **Automatic switching**: Responds to viewport changes and updates the active source seamlessly
- **Performance-first**: Uses requestAnimationFrame for resize throttling and passive event listeners
- **Framework-agnostic**: Pure web component that works with any framework or no framework at all
- **Tiny footprint**: Single class, no dependencies, ~2KB minified

## Installation

```bash
npm install @magic-spells/responsive-video
```

Or use directly from a CDN:

```html
<script type="module" src="https://unpkg.com/@magic-spells/responsive-video"></script>
```

## Quick Start

```html
<responsive-video
  mobile-video="https://cdn.example.com/video-portrait.mp4"
  desktop-video="https://cdn.example.com/video-landscape.mp4"
  mobile-poster="https://cdn.example.com/poster-portrait.jpg"
  desktop-poster="https://cdn.example.com/poster-landscape.jpg"
  breakpoint="900"
>
  <video autoplay muted playsinline loop></video>
</responsive-video>
```

The component automatically:
1. Detects the viewport width
2. Loads the appropriate video source and poster image
3. Applies the `src` and `poster` to the child `<video>` element
4. Re-evaluates when the window resizes
5. Sets `data-active-mode` to "mobile" or "desktop" for styling hooks

## API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mobile-video` | String | — | Video source URL for viewports narrower than the breakpoint |
| `desktop-video` | String | — | Video source URL for viewports equal to or wider than the breakpoint |
| `mobile-poster` | String | — | Poster image URL for viewports narrower than the breakpoint (optional) |
| `desktop-poster` | String | — | Poster image URL for viewports equal to or wider than the breakpoint (optional) |
| `breakpoint` | Number | `768` | Viewport width (in pixels) where the switch between mobile and desktop occurs |

### Behavior

- If viewport width ≥ breakpoint → loads `desktop-video` and `desktop-poster`
- If viewport width < breakpoint → loads `mobile-video` and `mobile-poster`
- If `mobile-video` is missing → falls back to `desktop-video` on all screen sizes
- Poster attributes are optional—if omitted, no poster is set
- If no matching video exists → component does nothing
- The component looks for the first `<video>` element in its light DOM

### Data Attributes

The component sets `data-active-mode` on itself to indicate which source is currently active:

```html
<responsive-video data-active-mode="mobile">...</responsive-video>
```

You can use this for conditional styling:

```css
responsive-video[data-active-mode="mobile"] {
  /* Mobile-specific styles */
}

responsive-video[data-active-mode="desktop"] {
  aspect-ratio: 16/9;
}
```

## How It Works

The `ResponsiveVideo` class extends `HTMLElement` and implements the Custom Elements API with these lifecycle hooks:

### Lifecycle

1. **`connectedCallback()`**: Queries for the child `<video>` element, attaches resize listeners, and performs initial source evaluation
2. **`disconnectedCallback()`**: Cleans up event listeners and cancels pending animation frames

The component does not use `observedAttributes` or `attributeChangedCallback`—attributes are read dynamically on connect and during resize events.

### Resize Handling

Window resize events are throttled using `requestAnimationFrame` to prevent excessive recalculation. The component only updates the video source when it detects an actual change (e.g., crossing the breakpoint threshold or when the video URL differs from the currently loaded source).

### Source Swapping

When the source needs to change:
1. The component updates the `<video>` element's `src` attribute
2. Updates the `poster` attribute (if a poster URL is provided for the active mode)
3. Calls `video.load()` to initiate loading
4. Attempts to auto-play if `video.autoplay` is true (catches and ignores errors for muted autoplay requirements)
5. Updates `data-active-mode` to reflect the active source ("mobile" or "desktop")

### Private Implementation Details

The component uses private class fields (denoted by `#`) to encapsulate state:
- `#videoEl`: Reference to the child video element
- `#currentSrc`: Currently loaded video URL to prevent redundant updates
- `#resizeRaf`: requestAnimationFrame ID for resize throttling
- `#boundResize`: Cached resize handler reference

## Use Cases

### E-commerce Hero Sections

```html
<responsive-video
  mobile-video="/assets/videos/hero-mobile.mp4"
  desktop-video="/assets/videos/hero-desktop.mp4"
  mobile-poster="/assets/images/hero-mobile-poster.jpg"
  desktop-poster="/assets/images/hero-desktop-poster.jpg"
  breakpoint="768"
>
  <video autoplay muted playsinline loop></video>
</responsive-video>
```

### Progressive Enhancement

```html
<responsive-video
  mobile-video="/videos/hero-mobile.mp4"
  desktop-video="/videos/hero-desktop.mp4"
  mobile-poster="/images/hero-mobile-poster.jpg"
  desktop-poster="/images/hero-desktop-poster.jpg"
>
  <video autoplay muted playsinline loop>
    <!-- Fallback for browsers without custom element support -->
    <source src="/videos/hero-desktop.mp4" type="video/mp4">
  </video>
</responsive-video>
```

## Development

Install dependencies:

```bash
npm install
```

Start the dev server with live reload:

```bash
npm run dev
```

This launches a local server on port 3006 with hot module replacement. The server serves both `dist/` and `demo/` directories. The demo uses CDN-hosted videos to avoid committing large files to the repository.

### Project Structure

```
responsive-video/
├── src/
│   └── responsive-video.js    # Source code (ES class)
├── demo/
│   └── index.html             # Demo page (uses CDN video URLs)
├── dist/                      # Build outputs (generated)
│   ├── responsive-video.esm.js    # ES Module
│   ├── responsive-video.cjs.js    # CommonJS
│   ├── responsive-video.js        # UMD
│   └── responsive-video.min.js    # Minified UMD
├── rollup.config.mjs          # Rollup bundler config
└── package.json
```

### Build Commands

```bash
# Production build (creates all distribution formats)
npm run build

# Lint source code
npm run lint

# Format code with Prettier
npm run format

# Start dev server
npm run dev
```

### Build Outputs

The build process generates four distribution formats:

1. **ESM** (`responsive-video.esm.js`) — For modern bundlers and `<script type="module">`
2. **CommonJS** (`responsive-video.cjs.js`) — For Node.js and older bundlers
3. **UMD** (`responsive-video.js`) — Universal module for direct browser usage
4. **Minified UMD** (`responsive-video.min.js`) — Production-ready minified bundle

All builds include sourcemaps except the minified version.

## Browser Support

Supports all modern browsers that implement [Custom Elements v1](https://caniuse.com/custom-elementsv1):

- Chrome/Edge 67+
- Firefox 63+
- Safari 10.1+
- iOS Safari 10.3+

For older browsers, use a [Custom Elements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements).

## Performance Considerations

- Component registers with the Custom Elements registry only once
- Resize events are throttled via `requestAnimationFrame`
- Source updates are skipped when no actual change is detected
- Event listeners use `{ passive: true }` for better scroll performance
- Video element is cached to avoid repeated DOM queries
- Cleanup happens automatically on disconnect

## License

MIT © [Cory Schulz](https://github.com/magic-spells)

## Contributing

Issues and pull requests are welcome at [github.com/magic-spells/responsive-video](https://github.com/magic-spells/responsive-video).
