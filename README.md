# Oriah Site

Marketing site for Oriah, a faith operating system for the daily walk.

## Stack

- React 19
- TypeScript
- Vite
- Cloudflare Pages Functions

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build script regenerates the brand assets before compiling the site.

## Asset Pipeline

Brand assets are generated from the local source icon at:

`/Users/benmoradi/oriah/branding/oriah-icon-source.png`

Generated outputs include:

- `public/assets/circle.png`
- `public/assets/1.png` through `public/assets/6.png`
- `public/assets/og-share.png`
- `public/favicon-dark-64.png`
- `public/apple-touch-icon.png`

To regenerate them directly:

```bash
npm run assets
```

## Domains

- Canonical site: [joinoriah.com](https://joinoriah.com)
- Redirect domain: [oriah.app](https://oriah.app)

The Pages middleware in `functions/_middleware.js` keeps `joinoriah.com` as the canonical host.

## Cloudflare Pages

Recommended project settings:

- Project name: `oriah-site`
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`

Attach both custom domains to the same Pages project:

- `joinoriah.com`
- `oriah.app`
