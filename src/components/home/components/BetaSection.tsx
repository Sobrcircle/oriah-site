import { useRef, useState } from 'react'
import type { HomeSection } from '../data/sections'

type Status = 'idle' | 'sending' | 'done' | 'error'

/**
 * Beta signup. One field, one button.
 *
 * The email is posted to `/functions/api/beta`, a Cloudflare Pages Function
 * that relays it to oriah@moradilabs.com with the subject "Beta request".
 * Nothing is stored in the browser and no third-party form service sees the
 * address.
 *
 * The hidden `company` input is a honeypot — a real person never sees it, so
 * anything that fills it in is a bot and the request is dropped server-side.
 * It is the cheapest spam defence that costs a human nothing; there is no
 * CAPTCHA here because making someone prove their humanity to ask for a
 * church-app invitation is a bad first impression.
 */
export default function BetaSection({ section }: { section: HomeSection }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const honeypot = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending' || status === 'done') return

    const value = email.trim()
    // Deliberately loose. Server validates too; the job here is to catch the
    // obvious typo before a round trip, not to police RFC 5322.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus('error')
      setMessage('That email does not look right.')
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const res = await fetch('/api/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          company: honeypot.current?.value ?? '',
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'Something went wrong.')
      }

      setStatus('done')
      setMessage('Thank you. We will be in touch.')
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Could not send that. Please try again.',
      )
    }
  }

  return (
    <section id={section.id} className="home-section home-beta">
      <div className="home-section-bg" aria-hidden="true" />
      <div className="home-section-overlay" aria-hidden="true" />

      <div className="home-copy home-beta-copy">
        <h2 className="home-title" data-split data-animate data-delay="0.1">
          {section.title}
        </h2>

        {section.content.map((paragraph, i) => (
          <p key={i} className="home-paragraph" data-animate data-delay={`${0.25 + i * 0.12}`}>
            {paragraph.map((span, j) => (
              <span key={j}>{span.text}</span>
            ))}
          </p>
        ))}

        <form className="home-beta-form" onSubmit={submit} data-animate data-delay="0.45" noValidate>
          <label className="home-beta-label" htmlFor="beta-email">
            Email address
          </label>

          <div className="home-beta-row">
            <input
              id="beta-email"
              className="home-beta-input"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              disabled={status === 'sending' || status === 'done'}
              aria-invalid={status === 'error'}
              aria-describedby={message ? 'beta-message' : undefined}
              required
            />

            <button
              className="home-beta-button"
              type="submit"
              disabled={status === 'sending' || status === 'done'}
            >
              {status === 'sending' ? 'Sending' : status === 'done' ? 'Sent' : 'Sign up'}
            </button>
          </div>

          {/* Honeypot. Hidden from people, irresistible to bots. */}
          <input
            ref={honeypot}
            className="home-beta-honeypot"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            defaultValue=""
          />

          <p
            id="beta-message"
            className={`home-beta-message ${status === 'error' ? 'is-error' : ''} ${status === 'done' ? 'is-done' : ''}`}
            role="status"
            aria-live="polite"
          >
            {message || ' '}
          </p>
        </form>

        <p className="home-beta-fineprint">
          We use your address to send the invitation and nothing else. No list,
          no newsletter, no sharing.
        </p>
      </div>
    </section>
  )
}
