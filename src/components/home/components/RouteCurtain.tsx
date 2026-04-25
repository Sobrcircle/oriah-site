import { useRouteTransition } from '../hooks/useRouteTransition'

export default function RouteCurtain() {
  const { leaving } = useRouteTransition()
  return (
    <div
      className={`home-route-curtain ${leaving ? 'is-leaving' : ''}`}
      aria-hidden="true"
    />
  )
}
