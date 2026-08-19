/**
 * POST /api/beta — beta invitation requests.
 *
 * Relays one email address to oriah@moradilabs.com with the subject
 * "Beta request". Nothing is stored: there is no database, no list, and no
 * third-party form service in the path, which is the whole reason this is a
 * Function rather than a Formspree embed. The address exists in exactly one
 * place afterwards — the inbox.
 *
 * Requires one Cloudflare Pages environment variable:
 *
 *   RESEND_API_KEY   a Resend API key (https://resend.com)
 *
 * and optionally:
 *
 *   BETA_TO          override the destination (default oriah@moradilabs.com)
 *   BETA_FROM        override the sender (default beta@joinoriah.com)
 *
 * BETA_FROM's domain has to be verified in Resend or the send is rejected.
 * If joinoriah.com is not verified yet, set BETA_FROM to
 * "onboarding@resend.dev", which Resend allows without verification and which
 * delivers to your own address fine.
 */

const TO_DEFAULT = 'oriah@moradilabs.com'
const FROM_DEFAULT = 'Oriah Beta <beta@joinoriah.com>'
const SUBJECT = 'Beta request'

// Loose on purpose — matching the client. An address that passes this and is
// still undeliverable simply bounces in the inbox, which is a cheaper failure
// than turning away a real person over an unusual TLD.
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

  // Single handler rather than onRequest + onRequestPost side by side —
  // exporting both leaves which one wins up to the runtime's precedence rules.
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

  // A bot filled the hidden field. Answer 200 rather than 400 — telling a
  // scraper which of its submissions were rejected is how it learns to stop
  // filling the honeypot.
  if (honeypot) return json(200, { ok: true })

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { error: 'That email does not look right.' })
  }

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    // Loud in the log, vague to the visitor: a misconfigured server is our
    // problem to see, not theirs to read.
    console.error('[beta] RESEND_API_KEY is not set — cannot send.')
    return json(500, { error: 'Signup is temporarily unavailable.' })
  }

  const to = env.BETA_TO || TO_DEFAULT
  const from = env.BETA_FROM || FROM_DEFAULT

  // Context that makes a request actionable without any tracking: where they
  // were, and roughly who they are. `cf` is Cloudflare's own request metadata,
  // so this costs no extra lookup and no third party.
  const cf = request.cf || {}
  const meta = [
    `Country: ${cf.country || 'unknown'}`,
    `City: ${cf.city || 'unknown'}`,
    `Referer: ${request.headers.get('referer') || 'direct'}`,
  ].join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // So hitting reply in the inbox answers the person who asked.
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
    console.error('[beta] send failed:', err)
    return json(502, { error: 'Could not send that. Please try again.' })
  }

  return json(200, { ok: true })
}
