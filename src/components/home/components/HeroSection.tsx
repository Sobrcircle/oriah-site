import type { HomeSection, TextSpan } from '../data/sections'
import PhoneMockup from './PhoneMockup'

function renderSpan(span: TextSpan, key: number) {
  switch (span.type) {
    case 'accent':
      return <span key={key} className="home-accent">{span.text}</span>
    case 'callout':
      return <span key={key} className="home-callout">{span.text}</span>
    default:
      return <span key={key}>{span.text}</span>
  }
}

type Props = {
  section: HomeSection
}

export default function HeroSection({ section }: Props) {
  return (
    <section id={section.id} className="home-section home-hero">
      <div className="home-section-bg" aria-hidden="true" />
      <div className="home-section-overlay" aria-hidden="true" />

      <div className="home-copy">
        <div className="home-hero-branding">
          <p className="home-brand-kicker">light of God</p>
          <img
            className="home-logo"
            src="/assets/logo-mark.png"
            alt="Oriah logo"
          />
          <h1 className="home-brand">Oriah</h1>
          <p className="home-tagline">Walk in the light.</p>
        </div>

        <div className="home-hero-divider" aria-hidden="true" />

        {section.content.map((paragraph, i) => (
          <p key={i} className="home-hero-line" data-animate data-delay={`${0.5 + i * 0.18}`}>
            {paragraph.map((span, j) => renderSpan(span, j))}
          </p>
        ))}
      </div>

      {section.phoneImage && (
        <div data-animate data-delay="1.1">
          <PhoneMockup src={section.phoneImage} />
        </div>
      )}

      <div className="home-scroll-hint" data-animate data-delay="1.5" aria-hidden="true">
        <div className="home-scroll-hint-line" />
      </div>
    </section>
  )
}
