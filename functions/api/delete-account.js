/**
 * POST /api/delete-account — account deletion requests.
 *
 * WHY THIS EXISTS
 *
 * The delete-account form used to POST straight to
 * `https://formsubmit.co/ajax/privacy@joinoriah.com`, which was wrong twice
 * over:
 *
 *   1. joinoriah.com has NO MX RECORDS. Nothing has ever been able to receive
 *      mail at privacy@joinoriah.com, so every deletion request submitted
 *      through that form bounced into nothing — while the page told the person
 *      "Request sent. We will review it." Account deletion is a legal
 *      obligation under PIPEDA and GDPR and a hard App Store requirement, so a
 *      silently-dropped request is the worst possible bug on this page.
 *
 *   2. It handed a third party (formsubmit.co) a person's name, email, user
 *      ID, platform and free-text details — an unvetted processor, with no
 *      agreement, handling exactly the data class the request is about. For an
 *      app whose pitch is privacy, that was the wrong shape regardless of
 *      whether the mail arrived.
 *
 * Now it goes through the `oriah-mailer` Worker to an address on
 * moradilabs.com, which has live Google MX. No third party, no API key.
 *
 * See functions/api/beta.js for the two send paths and their trade-off.
 */

const TO_DEFAULT = 'oriah@moradilabs.com'
const FROM_DEFAULT = 'Oriah <notifications@joinoriah.com>'
const SUBJECT = 'Account deletion request'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// 503, not 502. Cloudflare's edge replaces a 502 from a Function with its own
// HTML error page, so the JSON body never reaches the browser and the form
// falls back to a generic message instead of showing what actually happened.
// 503 passes through untouched.
const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

/** Trim and cap every free-text field before it goes anywhere near an email. */
const field = (value, max = 300) => String(value ?? '').trim().slice(0, max) || 'Not provided'

export async function onRequest(context) {
  const { request, env } = context

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

  if (honeypot) return json(200, { ok: true })

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json(400, { error: 'Enter the email address on the account.' })
  }

  const cf = request.cf || {}
  const body = [
    `Account email: ${email}`,
    `Full name: ${field(payload?.name)}`,
    `User ID or username: ${field(payload?.accountId)}`,
    `Platform: ${field(payload?.platform, 60)}`,
    `Details: ${field(payload?.details, 2000)}`,
    '',
    `Country: ${cf.country || 'unknown'}`,
    `Submitted from: ${request.headers.get('referer') || 'direct'}`,
  ].join('\n')

  // Try the keyless path, then fall THROUGH to Resend rather than returning
  // its error — see the note in beta.js. Cloudflare Email Sending is an
  // open-beta feature enabled per account, so the binding can exist and still
  // be unable to send. On this page that matters more than anywhere else: a
  // deletion request must not be lost because a preferred transport was
  // wired up but not yet working.
  let mailerFailed = false
  if (env.MAILER) {
    try {
      const res = await env.MAILER.fetch('https://oriah-mailer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'delete-account', email, body }),
      })
      if (res.ok) return json(200, { ok: true })
      console.error(`[delete-account] mailer returned ${res.status}`)
      mailerFailed = true
    } catch (err) {
      console.error('[delete-account] mailer binding failed:', err)
      mailerFailed = true
    }
    if (mailerFailed && !env.RESEND_API_KEY) {
      return json(503, { error: 'Could not send that. Please try again.' })
    }
  }

  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.BETA_FROM || FROM_DEFAULT,
          to: [env.BETA_TO || TO_DEFAULT],
          reply_to: email,
          subject: SUBJECT,
          text: `${email} requested account deletion.\n\n${body}\n`,
        }),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.error(`[delete-account] Resend returned ${res.status}: ${detail}`)
        return json(503, { error: 'Could not send that. Please try again.' })
      }
    } catch (err) {
      console.error('[delete-account] Resend send failed:', err)
      return json(503, { error: 'Could not send that. Please try again.' })
    }
    return json(200, { ok: true })
  }

  // Deliberately a hard failure rather than a cheerful lie. The previous
  // implementation's defining bug was telling people their deletion request
  // had been received when it had not.
  console.error('[delete-account] neither MAILER nor RESEND_API_KEY is configured.')
  return json(500, { error: 'Could not send that. Please email us directly.' })
}
