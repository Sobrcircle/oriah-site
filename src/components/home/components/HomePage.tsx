import { useState } from 'react'
import { sections } from '../data/sections'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useLenis } from '../hooks/useLenis'
import { useSplitReveal } from '../hooks/useSplitReveal'
import HeroSection from './HeroSection'
import FeatureSection from './FeatureSection'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import FilmGrain from './FilmGrain'
import CursorGlow from './CursorGlow'
import Preloader from './Preloader'
import ScrollProgress from './ScrollProgress'
import RouteCurtain from './RouteCurtain'
import '../styles/home.css'

export default function HomePage() {
  const [booted, setBooted] = useState(false)

  useLenis()
  useScrollAnimation(booted)
  useSplitReveal(booted)

  let featureIndex = 0

  return (
    <div className="home-page">
      <Preloader onDone={() => setBooted(true)} />

      <FilmGrain />
      <CursorGlow />
      <ScrollProgress />
      <RouteCurtain />

      <SiteNav />
      <div className="home-vignette" aria-hidden="true" />

      <main className="home-main">
        {sections.map((section) => {
          if (section.type === 'hero') {
            return <HeroSection key={section.id} section={section} />
          }

          const reverse = featureIndex % 2 === 1
          featureIndex++
          return <FeatureSection key={section.id} section={section} reverse={reverse} />
        })}
      </main>

      <SiteFooter />
    </div>
  )
}
