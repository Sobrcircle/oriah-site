import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Character-level reveal on elements marked [data-split].
 * Wraps each word in a <span class="split-word">, each char in <span class="split-char">,
 * then animates them with a staggered blur-to-focus fade.
 *
 * Runs once after fonts load so positions are final.
 */
export function useSplitReveal(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const run = () => {
      const targets = document.querySelectorAll<HTMLElement>('[data-split]')
      if (!targets.length) return

      targets.forEach((el) => {
        if (el.dataset.splitDone === '1') return
        const text = el.textContent || ''
        el.textContent = ''
        const frag = document.createDocumentFragment()
        const words = text.split(/(\s+)/) // keep spaces
        const chars: HTMLSpanElement[] = []
        words.forEach((word) => {
          if (/^\s+$/.test(word)) {
            frag.appendChild(document.createTextNode(word))
            return
          }
          const wordSpan = document.createElement('span')
          wordSpan.className = 'split-word'
          for (const ch of word) {
            const charSpan = document.createElement('span')
            charSpan.className = 'split-char'
            charSpan.textContent = ch
            wordSpan.appendChild(charSpan)
            chars.push(charSpan)
          }
          frag.appendChild(wordSpan)
        })
        el.appendChild(frag)
        el.dataset.splitDone = '1'

        gsap.set(chars, { opacity: 0, y: 18, filter: 'blur(6px)' })

        gsap.to(chars, {
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.018,
          delay: parseFloat(el.dataset.splitDelay || '0'),
        })
      })
    }

    // Wait for fonts so splitting happens at final metrics.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run)
    } else {
      run()
    }
  }, [enabled])
}
