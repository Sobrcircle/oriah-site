/**
 * oriah-mailer — the only thing in the stack allowed to send email.
 *
 * Exists because Pages Functions cannot hold a `send_email` binding; only
 * Workers can. Pages *can* hold a Service binding, so the Pages Functions call
 * this Worker and this Worker does the send. The payoff is that no API key
 * exists anywhere in the system — nothing to paste into a dashboard, nothing
 * to rotate, nothing to leak in a commit.
 *
 * It has no route and no workers.dev subdomain. The only way in is the Service
 * binding, so there is no public URL to discover. That matters more than usual
 * here: a mail sender with an open endpoint is an open relay, and an open
 * relay on your own domain is how a domain's sending reputation dies.
 *
 * Setup, once:
 *
 *   npx wrangler email sending enable joinoriah.com
 *   cd workers/mailer && npx wrangler deploy
 *
 * then bind it in the Pages project:
 *
 *   Workers & Pages → oriah-site → Settings → Functions → Service bindings
 *   Variable name: MAILER      Service: oriah-mailer
 */

const FROM = { email: 'notifications@joinoriah.com', name: 'Oriah' }

/**
 * Message kinds, whitelisted.
 *
 * The caller supplies a KIND, never a subject or a destination. A Service
 * binding guarantees the caller is ours; it does not guarantee the caller is
 * correct. If a Pages Function is ever buggy or compromised, the worst it can
 * do here is send one of these two fixed messages to one of these two fixed
 * addresses — it cannot be turned into a general-purpose relay.
 *
 * Both addresses are on moradilabs.com deliberately. joinoriah.com has NO MX
 * RECORDS: mail to privacy@joinoriah.com, which this form used to target
 * through formsubmit.co, could never have arrived. moradilabs.com has live
 * Google MX.
 */
const KINDS = {
  beta: {
    to: 'oriah@moradilabs.com',
    subject: 'Beta request',
    lead: 'asked for a beta invitation.',
  },
  'delete-account': {
    to: 'oriah@moradilabs.com',
    subject: 'Account deletion request',
    lead: 'requested account deletion.',
  },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json(405, { error: 'Method not allowed.' })
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return json(400, { error: 'Malformed request.' })
    }

    const kind = KINDS[String(payload?.kind ?? '')]
    if (!kind) return json(400, { error: 'Unknown message kind.' })

    // Re-validated here rather than trusted from the caller, for the same
    // reason the kind is whitelisted: a bug on the Pages side should not be
    // able to hand this Worker a header-injection string and have it forwarded
    // to the mail service unchecked.
    const email = String(payload?.email ?? '').trim()
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return json(400, { error: 'Invalid address.' })
    }

    const body = String(payload?.body ?? '').slice(0, 4000)
    const text = `${email} ${kind.lead}\n\n${body}\n`

    try {
      await env.EMAIL.send({
        to: kind.to,
        from: FROM,
        // So replying in the inbox answers the person who asked.
        replyTo: email,
        subject: kind.subject,
        text,
        // Both parts, always. Some clients render only text, and a text-less
        // message scores worse with spam filters.
        html:
          `<p><strong>${escapeHtml(email)}</strong> ${escapeHtml(kind.lead)}</p>` +
          `<pre style="font:13px ui-monospace,monospace;color:#555;white-space:pre-wrap">${escapeHtml(body)}</pre>`,
      })
    } catch (err) {
      console.error(`[mailer] ${payload.kind} send failed:`, err)
      return json(502, { error: 'Send failed.' })
    }

    return json(200, { ok: true })
  },
}

/**
 * These land in an inbox that renders HTML, so they are untrusted input
 * arriving in a rendered document — escaped even though the regex above makes
 * angle brackets impossible in the address today, because that regex is one
 * loosening away from not doing so, and `body` was never constrained at all.
 */
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
}
