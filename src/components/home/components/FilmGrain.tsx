/**
 * Fixed SVG turbulence overlay — gives the dark palette the warmth of print/film.
 * 3% opacity, pointer-events: none, z-index above backgrounds but below text.
 */
export default function FilmGrain() {
  return (
    <div className="film-grain" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="film-grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-noise)" />
      </svg>
    </div>
  )
}
