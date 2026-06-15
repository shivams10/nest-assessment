const TOKEN_KEY = 'ip_access_token'

export type JwtPayload = {
  sub:   string
  email: string
  role:  string
  iat:   number
  exp:   number
}

export const tokenStorage = {
  get:   (): string | null => localStorage.getItem(TOKEN_KEY),
  set:   (token: string): void => { localStorage.setItem(TOKEN_KEY, token) },
  clear: (): void => { localStorage.removeItem(TOKEN_KEY) },
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(atob(payload)) as JwtPayload
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token)
  if (!payload) return true
  return payload.exp * 1000 < Date.now()
}
