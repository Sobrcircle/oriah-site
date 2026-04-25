export default function SiteNav() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="home-nav" aria-label="Main navigation">
      <div className="home-nav-group home-nav-group--left">
        <a href="#rhythm" onClick={scrollTo('rhythm')}>Rhythm</a>
        <a href="#circles" onClick={scrollTo('circles')}>Circles</a>
      </div>
      <a href="#home" className="home-nav-brand" onClick={scrollTo('home')} aria-label="Oriah">
        <img src="/assets/circle.png" alt="" className="home-nav-logo" />
      </a>
      <div className="home-nav-group home-nav-group--right">
        <a href="#churches" onClick={scrollTo('churches')}>Churches</a>
        <a href="#story" onClick={scrollTo('story')}>Why Oriah</a>
      </div>
    </nav>
  )
}
