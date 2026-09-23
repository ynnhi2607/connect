import { type FormEvent, type PointerEvent, useEffect, useState } from 'react'
import {
  type AuthUser,
  TOKEN_KEY,
  getMe,
  login,
  register,
} from '../../lib/auth'
import AuthHero from './components/AuthHero'
import AuthPanel, { type AuthForm, type AuthMode } from './components/AuthPanel'
import Starfield from './components/Starfield'
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
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
      })
  }, [token])

  function updateField(field: keyof AuthForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

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
      setMessage('Signed in successfully')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setMessage('')
  }

  function handleSkyMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    event.currentTarget.style.setProperty('--pointer-x', `${x}%`)
    event.currentTarget.style.setProperty('--pointer-y', `${y}%`)
    event.currentTarget.style.setProperty('--tilt-x', `${(y - 50) / 10}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${(50 - x) / 10}deg`)
  }

  return (
    <main className="auth-shell" onPointerMove={handleSkyMove}>
      <Starfield />

      <section className="auth-stage">
        <AuthHero />
        <AuthPanel
          mode={mode}
          form={form}
          user={user}
          token={token}
          isLoading={isLoading}
          message={message}
          onModeChange={setMode}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onLogout={handleLogout}
        />
      </section>
    </main>
  )
}

export default AuthPage
