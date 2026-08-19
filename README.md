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

## Email

Both forms on the site send mail: the beta signup (`/api/beta`) and the
account-deletion request (`/api/delete-account`). Neither stores anything and
neither uses a third-party form service — the address ends up in one place,
the inbox at `oriah@moradilabs.com`.

There are two send paths, tried in that order:

1. **`MAILER`** — a Service binding to the `oriah-mailer` Worker in
   `workers/mailer/`, which holds Cloudflare's `send_email` binding. No API key
   exists in this path. Pages Functions cannot hold a `send_email` binding
   themselves, only Workers can, which is why the send lives one hop away.
   **Not active yet:** Cloudflare Email Sending is an open-beta feature and is
   not authorised on this account (`wrangler email sending enable` returns
   `Unauthorized [code: 2036]`). Do not add the Service binding until it is —
   the Functions fall through to Resend when the binding fails, so wiring it
   early is harmless but pointless.
2. **Resend** — used today. Requires two production variables:

   | variable | value |
   |---|---|
   | `RESEND_API_KEY` | key from resend.com/api-keys |
   | `BETA_FROM` | `Oriah Beta <beta@joinoriah.com>` |

   `joinoriah.com` is verified in Resend for sending. Note that verification is
   for *sending* only — the domain has **no MX records** and cannot receive
   mail, which is why every destination address on this site is on
   `moradilabs.com`.

Failures return **503**, not 502. Cloudflare's edge replaces a 502 from a
Function with its own HTML error page, which swallows the JSON body the form
needs to show a real message.

## Deploying

Production deploys have historically been direct uploads:

```bash
npm run build
npx wrangler pages deploy dist --project-name oriah-site --branch main
```

Between the site's launch commit and 2026-08-18 the repo had exactly one
commit, so nobody had ever tested whether `git push` builds. It did not — four
pushes on 2026-08-18 produced zero deployments. The Git integration was
reconnected on 2026-08-19; if a push does not produce a new deployment in
`wrangler pages deployment list`, it is still not wired and the command above
is the fallback.
