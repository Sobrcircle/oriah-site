/**
 * POST /api/beta — beta invitation requests.
 *
 * Relays one email address to oriah@moradilabs.com with the subject
 * "Beta request". Nothing is stored: no database, no list, no third-party
 * form service in the path. The address ends up in exactly one place — the
 * inbox.
 *
 * TWO WAYS TO SEND, in preference order:
 *
 *   1. `MAILER` — a Service binding to the `oriah-mailer` Worker, which holds
 *      Cloudflare's `send_email` binding. NO API KEY EXISTS in this path:
 *      nothing to paste into a dashboard, rotate, or leak. This is the one to
 *      use. Pages Functions cannot hold a `send_email` binding themselves —
 *      only Workers can — which is why the send lives one hop away in
 *      `workers/mailer/`.
 *
 *   2. `RESEND_API_KEY` — a plain HTTPS call to Resend. Works without any
 *      wrangler setup, so it unblocks a launch, but it reintroduces the
 *      secret that option 1 exists to avoid.
 *
 * Both are optional at build time and checked at request time, so the site
 * deploys and renders whether or not either is wired. With neither, the form
 * says "Signup is temporarily unavailable" rather than appearing to work.
 *
 * Setup for option 1 is in `workers/mailer/src/index.js`.
 */

const TO_DEFAULT = 'oriah@moradilabs.com'
const FROM_DEFAULT = 'Oriah Beta <beta@joinoriah.com>'
const SUBJECT = 'Beta request'

// Loose on purpose, and matched on the client. An address that passes this and
// is still undeliverable simply bounces in the inbox, which is a cheaper
// failure than turning away a real person over an unusual TLD.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })

export async function onRequest(context) {
  const { request, env } = context

  // One handler rather than onRequest + onRequestPost side by side — exporting
  // both leaves which one wins to the runtime's precedence rules.
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json(400, { error: 'Malformed request.' })
  }

  const email = String(payload?.email ?? '').trim()
  const honeypot = String(payload?.company ?? '').trim()

  // A bot filled the hidden field. Answer 200, not 400 — telling a scraper
  // which of its submissions were rejected is how it learns to stop filling
  // the honeypot.
  if (honeypot) return json(200, { ok: true })

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { error: 'That email does not look right.' })
  }

  // Context that makes a request actionable without any tracking: where they
  // were and how they arrived. `cf` is Cloudflare's own request metadata, so
  // it costs no extra lookup and involves no third party.
  const cf = request.cf || {}
  const meta = [
    `Country: ${cf.country || 'unknown'}`,
    `City: ${cf.city || 'unknown'}`,
    `Referer: ${request.headers.get('referer') || 'direct'}`,
  ].join('\n')

  // Try the keyless path, then fall THROUGH to Resend if it fails rather
  // than returning its error. Cloudflare Email Sending is an open-beta
  // feature that has to be enabled per account, so a MAILER binding can be
  // present and still be unable to send. Preferring the binding absolutely
  // would mean wiring it up silently disables a Resend path that works —
  // the setup step breaks the thing it was meant to improve.
  if (env.MAILER) {
    const viaBinding = await sendViaBinding(env, email, meta)
    if (viaBinding.ok || !env.RESEND_API_KEY) return viaBinding
    console.error('[beta] mailer failed, falling back to Resend')
  }
  if (env.RESEND_API_KEY) return sendViaResend(env, email, meta)

  // Loud in the log, vague to the visitor: a misconfigured server is our
  // problem to see, not theirs to read.
  console.error('[beta] neither MAILER nor RESEND_API_KEY is configured.')
  return json(500, { error: 'Signup is temporarily unavailable.' })
}

/** Preferred path — Service binding to the mailer Worker. No secrets. */
async function sendViaBinding(env, email, meta) {
  try {
    // A Service binding is invoked with fetch(). The URL host is ignored —
    // the request never leaves Cloudflare's network and never resolves DNS —
    // so this is a label for the log, not an address.
    const res = await env.MAILER.fetch('https://oriah-mailer/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'beta', email, body: meta }),
    })

    if (!res.ok) {
      console.error(`[beta] mailer returned ${res.status}`)
      return json(502, { error: 'Could not send that. Please try again.' })
    }
  } catch (err) {
    console.error('[beta] mailer binding failed:', err)
    return json(502, { error: 'Could not send that. Please try again.' })
  }

  return json(200, { ok: true })
}

/** Fallback path — Resend over HTTPS, using an API key. */
async function sendViaResend(env, email, meta) {
  const to = env.BETA_TO || TO_DEFAULT
  const from = env.BETA_FROM || FROM_DEFAULT

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: SUBJECT,
        text: `${email} asked for a beta invitation.\n\n${meta}\n`,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[beta] Resend returned ${res.status}: ${detail}`)
      return json(502, { error: 'Could not send that. Please try again.' })
    }
  } catch (err) {
    console.error('[beta] Resend send failed:', err)
    return json(502, { error: 'Could not send that. Please try again.' })
  }

  return json(200, { ok: true })
}
