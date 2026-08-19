import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * One line of verse, a beat of silence, then a curtain lift into the site.
 * Shows on every visit; skipped only for reduced-motion.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return true
  })
  const curtainRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) {
      onDone()
      return
    }

    // Lock scroll while curtain is up
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let done = false
    const finish = () => {
      if (done) return
      done = true
      document.body.style.overflow = prevOverflow
      setVisible(false)
      onDone()
    }

    const tl = gsap.timeline({ onComplete: finish })

    // Safety net: if GSAP stalls (e.g. tab backgrounded mid-tween),
    // guarantee the curtain lifts so the site stays usable.
    const failsafe = window.setTimeout(finish, 4000)

    // If the user tries to interact (tap, scroll, swipe), skip straight
    // to the site — a preloader should never feel like a wall.
    const skip = () => finish()
    window.addEventListener('pointerdown', skip, { once: true, passive: true })
    window.addEventListener('touchstart', skip, { once: true, passive: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })
    window.addEventListener('keydown', skip, { once: true })

    tl.fromTo(
      lineRef.current,
      { opacity: 0, y: 16, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' }
    )
      .to(lineRef.current, { opacity: 0.85, duration: 0.4 }, '+=0.5')
      .to(lineRef.current, { opacity: 0, y: -8, duration: 0.6, ease: 'power2.in' })
      .to(
        curtainRef.current,
        { y: '-100%', duration: 1.1, ease: 'power3.inOut' },
        '-=0.3'
      )

    return () => {
      tl.kill()
      window.clearTimeout(failsafe)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('touchstart', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('keydown', skip)
      document.body.style.overflow = prevOverflow
    }
  }, [visible, onDone])

  if (!visible) return null

  return (
    <div ref={curtainRef} className="preloader" aria-hidden="true">
      <div ref={lineRef} className="preloader-line">
        {/* The verse the tagline comes from, in the BSB wording the app
            itself bundles. It replaced "we choose what we see." — a line
            that was abstract, said nothing about God, and duplicated the
            closing accent in Why Oriah. Scripture is the product; opening
            on it is the most honest thing this screen can do. */}
        <span>If we walk in the light</span>
        <br />
        <span>as He is in the light,</span>
        <br />
        <span>we have fellowship with one another.</span>
        <cite className="preloader-cite">1 John 1:7</cite>
      </div>
    </div>
  )
}
