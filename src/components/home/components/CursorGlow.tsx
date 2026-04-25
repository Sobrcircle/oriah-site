/**
 * Warm-gold halo anchored near the top of the viewport.
 * No mouse/scroll tracking — it sits in a fixed position and content
 * scrolls past it, so sections light up as they pass under the halo.
 * Enabled on both desktop and mobile. Hidden only for reduced-motion.
 */
export default function CursorGlow() {
  return <div className="cursor-glow" aria-hidden="true" />
}
