import { type FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import {
  type AuthUser,
  TOKEN_KEY,
  getMe,
  login,
  register,
} from '../../lib/auth'
import AuthHero from './components/AuthHero'
import AuthPanel, { type AuthForm, type AuthMode } from './components/AuthPanel'
import OceanBackdrop from './components/OceanBackdrop'
import './auth.css'

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [form, setForm] = useState<AuthForm>({
    name: '',
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(Boolean(token))
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!token) return

    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
      })
      .finally(() => setIsRestoring(false))
  }, [token])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'ConnectSpace | Return to your people'
    return () => { document.title = oldTitle }
  }, [])

  function updateField(field: keyof AuthForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')
    setHasError(false)

    try {
      const response =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await register({
              name: form.name,
              email: form.email,
              password: form.password,
            })

      localStorage.setItem(TOKEN_KEY, response.token)
      setToken(response.token)
      setUser(response.user)
      setForm(current => ({ ...current, password: '' }))
      setMessage('You are safely signed in.')
    } catch (error) {
      setHasError(true)
      setMessage(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setIsRestoring(false)
    setMessage('')
    setHasError(false)
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setHasError(false)
  }

  return (
    <main className="auth-shell">
      <div className="auth-ocean-image" aria-hidden="true" />
      <OceanBackdrop />

      <header className="auth-nav">
        <a className="auth-brand" href="/" aria-label="ConnectSpace home">
          <Sparkles size={18} strokeWidth={1.3} /> ConnectSpace
        </a>
        <a className="back-link" href="/">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to the surface
        </a>
      </header>

      <section className="auth-stage">
        <AuthHero />
        <AuthPanel
          mode={mode}
          form={form}
          user={user}
          isLoading={isLoading}
          isRestoring={isRestoring}
          message={message}
          hasError={hasError}
          onModeChange={handleModeChange}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onLogout={handleLogout}
        />
      </section>

      <footer className="auth-footer"><span>A little less alone.</span><span>ConnectSpace</span></footer>
    </main>
  )
}

export default AuthPage
