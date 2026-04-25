import { useCallback, useEffect, useState } from 'react'

/**
 * Curtain fade on internal route navigation.
 * Intercepts clicks on links that change document (not just hash) and plays
 * a fade-to-black before letting the browser navigate.
 */
export function useRouteTransition() {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const a = target.closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      // only intercept same-origin, non-hash, non-new-tab clicks
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (href.startsWith('#')) return
      // Route transition for internal paths like /support or /privacy
      if (!href.startsWith('/')) return

      e.preventDefault()
      setLeaving(true)
      setTimeout(() => {
        window.location.href = href
      }, 520)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const cancel = useCallback(() => setLeaving(false), [])

  return { leaving, cancel }
}
