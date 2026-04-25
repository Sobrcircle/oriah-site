import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Inertial smooth scroll, synced with GSAP ScrollTrigger.
 * Respects prefers-reduced-motion.
 */
export function useLenis() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    // Touch devices: skip Lenis entirely. Even with syncTouch:false, Lenis
    // still patches <html>, runs a RAF loop, and its wheel handlers can end
    // up fighting the native touch scroll pipeline — the page feels
    // "sticky" and stutters when swiping. Native iOS/Android scroll is
    // already smooth; we only want Lenis for desktop wheel/trackpad.
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) {
      // Still intercept in-page anchor clicks so nav scrolls smoothly via
      // the native API (respects iOS rubber-band and momentum).
      const onAnchorClickNative = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
        if (!target) return
        const id = target.getAttribute('href')?.slice(1)
        if (!id) return
        const el = document.getElementById(id)
        if (!el) return
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      document.addEventListener('click', onAnchorClickNative)
      return () => document.removeEventListener('click', onAnchorClickNative)
    }

    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.2,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // Intercept anchor clicks so the nav scroll is buttery too
    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!target) return
      const id = target.getAttribute('href')?.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) })
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      lenis.destroy()
    }
  }, [])
}
