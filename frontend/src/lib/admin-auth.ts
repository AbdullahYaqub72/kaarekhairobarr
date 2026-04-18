export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'admin'

const ADMIN_UNLOCK_KEY = 'kkob-admin-unlocked'
const ADMIN_AUTH_KEY = 'kkob-admin-authenticated'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function unlockAdminAccess() {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(ADMIN_UNLOCK_KEY, 'true')
}

export function hasUnlockedAdminAccess() {
  if (!isBrowser()) {
    return false
  }

  return window.sessionStorage.getItem(ADMIN_UNLOCK_KEY) === 'true'
}

export function authenticateAdmin(username: string, password: string) {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return false
  }

  if (isBrowser()) {
    window.sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
  }

  return true
}

export function isAdminAuthenticated() {
  if (!isBrowser()) {
    return false
  }

  return window.sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
}

export function clearAdminSession() {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(ADMIN_AUTH_KEY)
  window.sessionStorage.removeItem(ADMIN_UNLOCK_KEY)
}
