export type AuthUser = {
  id: number
  name: string
  email: string
  createdAt: string
}

export type AuthResponse = {
  token: string
  expiresAt: string
  user: AuthUser
}

export const TOKEN_KEY = 'connectspace.jwt'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = LoginPayload & {
  name: string
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return response.json() as Promise<T>
}

async function readError(response: Response) {
  const fallback = 'Co loi xay ra, thu lai nhe'

  try {
    const body = (await response.json()) as {
      detail?: string
      message?: string
      error?: string
    }

    return body.detail ?? body.message ?? body.error ?? fallback
  } catch {
    return fallback
  }
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMe(token: string) {
  return apiRequest<AuthUser>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
