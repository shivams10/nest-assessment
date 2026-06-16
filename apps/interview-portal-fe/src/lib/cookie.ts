const EXPIRY_DAYS = 30

const expiryDate = (days: number): string => {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  return d.toUTCString()
}

export const cookieStorage = {
  set: (name: string, value: string): void => {
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiryDate(EXPIRY_DAYS)}; path=/; SameSite=Strict`
  },
  get: (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    if (!match || !match[1]) return null
    return decodeURIComponent(match[1])
  },
  delete: (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
  },
}
