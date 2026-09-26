import { type FormEvent, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, LogOut, Mail, Sparkles, User } from 'lucide-react'
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
  isLoading: boolean
  isRestoring: boolean
  message: string
  hasError: boolean
  onModeChange: (mode: AuthMode) => void
  onFieldChange: (field: keyof AuthForm, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onLogout: () => void
}

function AuthPanel({
  mode,
  form,
  user,
  isLoading,
  isRestoring,
  message,
  hasError,
  onModeChange,
  onFieldChange,
  onSubmit,
  onLogout,
}: AuthPanelProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-card">
      {isRestoring ? (
        <div className="auth-restoring" aria-live="polite">
          <LoaderCircle aria-hidden="true" />
          <span>Finding your connection...</span>
        </div>
      ) : user ? (
        <div className="session-card">
          <span className="session-mark" aria-hidden="true"><Sparkles /></span>
          <p className="eyebrow">CONNECTION FOUND</p>
          <h2>Welcome back,<br /><em>{user.name}</em></h2>
          <p className="session-email">Signed in as {user.email}</p>
          {message ? <p className="form-message" role="status">{message}</p> : null}
          <a className="primary-action" href="/">
            Return to the surface <ArrowRight aria-hidden="true" />
          </a>
          <Button className="secondary-action" type="button" variant="ghost" onClick={onLogout}>
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </div>
      ) : (
        <>
          <div className="card-header">
            <p className="eyebrow">A LITTLE LIGHT, KEPT SAFE</p>
            <h2>{mode === 'login' ? <>Enter your<br /><em>quiet space.</em></> : <>Begin a<br /><em>deeper connection.</em></>}</h2>
            <p className="card-support">
              {mode === 'login'
                ? 'Sign in to continue where you left off.'
                : 'Create a place for the thoughts that matter.'}
            </p>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => onModeChange('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => onModeChange('register')}
            >
              Sign up
            </button>
          </div>

          <form key={mode} className="auth-form" onSubmit={onSubmit}>
            {mode === 'register' ? (
              <label className="field">
                <span>Name</span>
                <div className="input-wrap">
                  <User aria-hidden="true" />
                  <Input
                    required
                    minLength={2}
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => onFieldChange('name', event.target.value)}
                    placeholder="How should we call you?"
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
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => onFieldChange('email', event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole aria-hidden="true" />
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={(event) => onFieldChange('password', event.target.value)}
                  placeholder="At least 6 characters"
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            <p className={`form-message${hasError ? ' error' : ''}`} role={hasError ? 'alert' : 'status'} aria-live="polite">
              {message}
            </p>

            <Button className="primary-action" type="submit" disabled={isLoading}>
              {isLoading
                ? <><LoaderCircle className="button-spinner" aria-hidden="true" /> Connecting...</>
                : mode === 'login'
                  ? <>Find your connection <ArrowRight aria-hidden="true" /></>
                  : <>Create your space <ArrowRight aria-hidden="true" /></>}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}

export default AuthPanel
