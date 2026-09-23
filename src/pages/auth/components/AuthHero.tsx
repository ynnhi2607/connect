import { Sparkles } from 'lucide-react'

function AuthHero() {
  return (
    <div className="auth-copy">
      <div className="brand">
        <span className="brand-mark">
          <Sparkles aria-hidden="true" />
        </span>
        <span>ConnectSpace</span>
      </div>

      <div className="headline">
        <p>Private Space For Real Conversations</p>
        <h1>Connect</h1>
        <span>Where every message finds its own orbit.</span>
      </div>

      <div className="signal-grid" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default AuthHero
