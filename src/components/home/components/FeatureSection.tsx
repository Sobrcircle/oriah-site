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
  reverse?: boolean
}

export default function FeatureSection({ section, reverse }: Props) {
  const hasPhone = !!section.phoneImage

  return (
    <section id={section.id} className={`home-section ${hasPhone ? 'home-section--split' : ''} ${reverse ? 'home-section--reverse' : ''}`}>
      <div className="home-section-bg" aria-hidden="true" />
      <div className="home-section-overlay" aria-hidden="true" />

      <div className={hasPhone ? 'home-split' : 'home-copy'}>
        <div className={hasPhone ? 'home-split-text' : undefined}>
          {section.kicker && (
            <span className="home-kicker" data-animate data-delay="0.05">{section.kicker}</span>
          )}

          <h2 className="home-title" data-split data-animate data-delay="0.1">{section.title}</h2>

          {section.content.map((paragraph, i) => (
            <p
              key={i}
              className={`home-paragraph ${paragraph.length === 1 && paragraph[0].type === 'callout' ? 'home-paragraph--callout' : ''}`}
              data-animate
              data-delay={`${0.25 + i * 0.12}`}
            >
              {paragraph.map((span, j) => renderSpan(span, j))}
            </p>
          ))}

          {section.id === 'story' && (
            <p className="home-signature" data-animate data-delay="0.9">— Behnam, Founder</p>
          )}
        </div>

        {section.phoneImage && (
          <div className="home-split-phone" data-animate data-delay="0.3">
            <PhoneMockup src={section.phoneImage} />
          </div>
        )}
      </div>
    </section>
  )
}
