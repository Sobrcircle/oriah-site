export default function SiteNav() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="home-nav" aria-label="Main navigation">
      <div className="home-nav-group home-nav-group--left">
        <a href="#rhythm" onClick={scrollTo('rhythm')}>Rhythm</a>
        <a href="#word" onClick={scrollTo('word')}>Word</a>
      </div>
      <a href="#home" className="home-nav-brand" onClick={scrollTo('home')} aria-label="Oriah">
        <img src="/assets/circle.png" alt="" className="home-nav-logo" />
      </a>
      <div className="home-nav-group home-nav-group--right">
        <a href="#circles" onClick={scrollTo('circles')}>Circles</a>
        {/* The only nav item that asks for something, so the only one styled
            as an action. Churches came out of the nav: it is not built yet,
            and a nav entry implies it is. */}
        <a href="#beta" className="home-nav-cta" onClick={scrollTo('beta')}>Join the beta</a>
      </div>
    </nav>
  )
}
