import type { FormEvent } from 'react'
import { LockKeyhole, LogOut, Mail, Rocket, User } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import type { AuthUser } from '../../../lib/auth'

export type AuthMode = 'login' | 'register'

export type AuthForm = {
  name: string
  email: string
  password: string
}

type AuthPanelProps = {
  mode: AuthMode
  form: AuthForm
  user: AuthUser | null
  token: string
  isLoading: boolean
  message: string
  onModeChange: (mode: AuthMode) => void
  onFieldChange: (field: keyof AuthForm, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onLogout: () => void
}

function AuthPanel({
  mode,
  form,
  user,
  token,
  isLoading,
  message,
  onModeChange,
  onFieldChange,
  onSubmit,
  onLogout,
}: AuthPanelProps) {
  return (
    <div className="auth-card">
      {user ? (
        <div className="session-card">
          <div className="session-orbit" aria-hidden="true">
            <Rocket />
          </div>
          <p className="eyebrow">Session Active</p>
          <h2>Welcome, {user.name}</h2>
          <p className="session-email">{user.email}</p>
          <div className="token-preview">
            <span>JWT</span>
            <code>{token.slice(0, 24)}...</code>
          </div>
          <Button className="primary-action" type="button" onClick={onLogout}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      ) : (
        <>
          <div className="card-header">
            <p className="eyebrow">Secure sign in</p>
            <h2>{mode === 'login' ? 'Enter your space' : 'Create your account'}</h2>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => onModeChange('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => onModeChange('register')}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            {mode === 'register' ? (
              <label className="field">
                <span>Name</span>
                <div className="input-wrap">
                  <User aria-hidden="true" />
                  <Input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(event) => onFieldChange('name', event.target.value)}
                    placeholder="Alex Morgan"
                  />
                </div>
              </label>
            ) : null}

            <label className="field">
              <span>Email</span>
              <div className="input-wrap">
                <Mail aria-hidden="true" />
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => onFieldChange('email', event.target.value)}
                  placeholder="you@connect.space"
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole aria-hidden="true" />
                <Input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(event) => onFieldChange('password', event.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
            </label>

            {message ? <p className="form-message">{message}</p> : null}

            <Button className="primary-action" type="submit" disabled={isLoading}>
              <Rocket aria-hidden="true" />
              {isLoading
                ? 'Processing...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}

export default AuthPanel
