import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Magnetic pull toward the cursor within a radius.
 * Haptic tick on tap (Android — iOS silently no-ops).
 * Respects reduced-motion and touch-only devices (returns the ref untouched).
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.35,
  radius = 120,
  haptic = true,
}: { strength?: number; radius?: number; haptic?: boolean } = {}) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) {
      // Touch device: no magnetism, but keep the haptic on tap
      if (haptic) {
        const onTap = () => {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8)
          }
        }
        el.addEventListener('touchstart', onTap, { passive: true })
        return () => el.removeEventListener('touchstart', onTap)
      }
      return
    }

    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist < radius) {
        xTo(dx * strength)
        yTo(dy * strength)
      } else {
        xTo(0)
        yTo(0)
      }
    }

    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    const onClick = () => {
      if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('click', onClick)
    }
  }, [strength, radius, haptic])

  return ref
}
