export default function SiteNav() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="home-nav" aria-label="Main navigation">
      <div className="home-nav-group home-nav-group--left">
        <a href="#morning" onClick={scrollTo('morning')}>Today</a>
        <a href="#bible" onClick={scrollTo('bible')}>Bible</a>
      </div>
      <a href="#home" className="home-nav-brand" onClick={scrollTo('home')} aria-label="Oriah">
        <img src="/assets/logo-mark.png" alt="" className="home-nav-logo" />
      </a>
      <div className="home-nav-group home-nav-group--right">
        <a href="#story" onClick={scrollTo('story')}>Why Oriah</a>
        {/* Plain text like every other item. A pill-shaped CTA up here pulled
            the eye away from the page before it had said anything, and the
            signup already closes the page. Concrete nouns throughout —
            "Today", "Bible", "Why Oriah" mean something to someone who has
            never opened the app; "Rhythm" and "Word" did not. */}
        <a href="#beta" onClick={scrollTo('beta')}>Beta</a>
      </div>
    </nav>
  )
}
