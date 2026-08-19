export default function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer-inner">
        <div className="home-footer-brand">
          <img className="home-footer-logo" src="/assets/logo-mark.png" alt="Oriah logo" />
          <div>
            <p className="home-footer-name">Oriah</p>
            <p className="home-footer-tagline">Walk in the light.</p>
          </div>
        </div>

        <div className="home-footer-links" aria-label="Legal and support links">
          <a href="/support">Support</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/delete-account">Delete Account</a>
        </div>

        <p className="home-footer-note">
          Oriah is a faith companion, not a substitute for pastoral care, counseling, medical advice, or emergency services.
        </p>

        <p className="home-footer-credit">
          Built by Moradi Labs Inc.
        </p>
      </div>
    </footer>
  )
}
