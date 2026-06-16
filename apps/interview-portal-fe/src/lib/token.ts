import { cookieStorage } from '@/lib/cookie'

// Each token is split across two stores so neither half alone is a valid JWT.
//   localStorage  → header.payload  (set by FE after OAuth callback)
//   cookie        → signature       (set by server via Set-Cookie)
//
// FE recombines both halves as  `body + '.' + sig`  before every API request.

const ACCESS_BODY_KEY    = 'ip_access_body'
const REFRESH_BODY_KEY   = 'ip_refresh_body'
const ACCESS_SIG_COOKIE  = 'ip_access_sig'
const REFRESH_SIG_COOKIE = 'ip_refresh_sig'

export type JwtPayload = {
  sub:   string
  email: string
  role:  string
  iat:   number
  exp:   number
}

export const accessTokenStore = {
  setBody: (body: string): void  => { localStorage.setItem(ACCESS_BODY_KEY, body) },
  getBody: (): string | null     => localStorage.getItem(ACCESS_BODY_KEY),
  getSig:  (): string | null     => cookieStorage.get(ACCESS_SIG_COOKIE),
  get:     (): string | null     => {
    const body = localStorage.getItem(ACCESS_BODY_KEY)
    const sig  = cookieStorage.get(ACCESS_SIG_COOKIE)
    return body && sig ? `${body}.${sig}` : null
  },
  clear: (): void => { localStorage.removeItem(ACCESS_BODY_KEY) },
}

export const refreshTokenStore = {
  setBody: (body: string): void  => { localStorage.setItem(REFRESH_BODY_KEY, body) },
  getBody: (): string | null     => localStorage.getItem(REFRESH_BODY_KEY),
  getSig:  (): string | null     => cookieStorage.get(REFRESH_SIG_COOKIE),
  get:     (): string | null     => {
    const body = localStorage.getItem(REFRESH_BODY_KEY)
    const sig  = cookieStorage.get(REFRESH_SIG_COOKIE)
    return body && sig ? `${body}.${sig}` : null
  },
  clear: (): void => { localStorage.removeItem(REFRESH_BODY_KEY) },
}

export const tokenStorage = {
  set: (accessBody: string, refreshBody: string): void => {
    accessTokenStore.setBody(accessBody)
    refreshTokenStore.setBody(refreshBody)
  },
  clearAll: (): void => {
    accessTokenStore.clear()
    refreshTokenStore.clear()
  },
}

// Works on both full token (header.payload.sig) and just the body (header.payload)
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    return JSON.parse(atob(part)) as JwtPayload
  } catch {
    return null
  }
}

export const isTokenExpired = (tokenOrBody: string): boolean => {
  const payload = decodeToken(tokenOrBody)
  if (!payload) return true
  return payload.exp * 1000 < Date.now()
}

export const isAuthenticated = (): boolean => {
  const body = accessTokenStore.getBody()
  const sig  = accessTokenStore.getSig()
  if (!body || !sig) return false
  return !isTokenExpired(body)
}
