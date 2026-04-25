import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollAnimation(booted: boolean = true) {
  // Mount — pre-hide everything so nothing flashes before the curtain lifts.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
        el.style.filter = 'none'
      })
      return
    }

    document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
      gsap.set(el, { opacity: 0 })
    })

    document.querySelectorAll<HTMLElement>('.home-phone-wrap').forEach((phone) => {
      gsap.set(phone, { transformPerspective: 1200, opacity: 0, scale: 0.92 })
    })

    const heroLogo = document.querySelector('.home-logo')
    const heroBrand = document.querySelector('.home-brand')
    const heroTagline = document.querySelector('.home-tagline')
    if (heroLogo) gsap.set(heroLogo, { opacity: 0, scale: 0 })
    if (heroBrand) gsap.set(heroBrand, { opacity: 0, y: 16 })
    if (heroTagline) gsap.set(heroTagline, { opacity: 0 })
  }, [])

  // After boot — wire up ScrollTrigger-based reveals and hero entrance.
  // ScrollTrigger is used (not IntersectionObserver) because Lenis drives
  // ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`, so this is
  // the path that reliably fires on both desktop and mobile native touch.
  useEffect(() => {
    if (!booted) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const triggers: ScrollTrigger[] = []

    const run = () => {
      // Body / text block reveals.
      document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay || '0')
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              duration: 1.0,
              delay,
              ease: 'power2.out',
            })
          },
        })
        triggers.push(st)
      })

      // Phone entrance.
      const phones = document.querySelectorAll<HTMLElement>('.home-phone-wrap')
      const isMobile = window.innerWidth < 700
      phones.forEach((phone, i) => {
        const st = ScrollTrigger.create({
          trigger: phone,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(phone, {
              opacity: 1,
              scale: 1,
              duration: 1.3,
              ease: 'power3.out',
            })
          },
        })
        triggers.push(st)

        const shell = phone.querySelector<HTMLElement>('.home-phone-shell')
        if (!isMobile) {
          gsap.fromTo(
            phone,
            { y: 20, rotateX: 4, rotateY: -2 },
            {
              scrollTrigger: {
                trigger: phone,
                start: 'top 95%',
                end: 'bottom 10%',
                scrub: 1.4,
              },
              y: -20,
              rotateX: -3,
              rotateY: 2,
              ease: 'none',
            }
          )
        }

        if (shell) {
          gsap.to(shell, {
            y: isMobile ? 6 : 10,
            duration: 4.5 + i * 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.5,
          })
        }
      })

      ScrollTrigger.refresh()
    }

    // Wait for fonts so measurements are against final layout.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run)
    } else {
      run()
    }

    // Note: no image-load or resize refresh here. The phone images have an
    // explicit aspect-ratio so layout never shifts when they load, and the
    // mobile URL bar constantly fires resize events as it collapses/expands
    // during native scroll — refreshing ScrollTrigger on each one
    // interrupts scroll momentum and feels like the page is "anchoring".

    // Hero branding entrance — plays as the curtain lifts.
    const heroLogo = document.querySelector('.home-logo')
    const heroBrand = document.querySelector('.home-brand')
    const heroTagline = document.querySelector('.home-tagline')
    const heroTl = gsap.timeline({ delay: 0.1 })
    if (heroLogo) {
      heroTl
        .fromTo(heroLogo,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1.35, duration: 1, ease: 'power2.out' }
        )
        .to(heroLogo,
          { scale: 1, duration: 0.8, ease: 'power2.inOut' }
        )
    }
    if (heroBrand) {
      heroTl.fromTo(heroBrand,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        0.6
      )
    }
    if (heroTagline) {
      heroTl.fromTo(heroTagline,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, ease: 'power2.out' },
        1.1
      )
    }

    return () => {
      triggers.forEach((t) => t.kill())
      heroTl.kill()
    }
  }, [booted])
}
