type Props = {
  src: string
}

export default function PhoneMockup({ src }: Props) {
  return (
    <div className="home-phone-wrap" aria-hidden="true">
      <div className="home-phone-shell">
        <div className="home-phone-screen">
          <img src={src} alt="" loading="lazy" />
        </div>
      </div>
    </div>
  )
}
