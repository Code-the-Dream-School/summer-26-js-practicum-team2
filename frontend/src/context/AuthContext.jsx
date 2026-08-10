import { useState } from 'react'
import {
  forgotPasswordRequest,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordRequest,
  verifyUserEmail,
} from '../services/api.js'
import { AuthContext } from './authContext.js'

const AUTH_USER_KEY = 'sprout.auth.user'
const AUTH_CSRF_KEY = 'sprout.auth.csrf'
const AUTH_PERSIST_KEY = 'sprout.auth.persist'
const PERSIST_SESSION = 'session'
const PERSIST_LOCAL = 'local'

const readStorageValue = (storage, key) => {
  return storage.getItem(key)
}

const readStoredUser = (storage) => {
  const stored = readStorageValue(storage, AUTH_USER_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

const getStorageForMode = (mode) => {
  if (typeof window === 'undefined') {
    return null
  }

  return mode === PERSIST_LOCAL ? window.localStorage : window.sessionStorage
}

const clearPersistedAuth = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(AUTH_USER_KEY)
  window.sessionStorage.removeItem(AUTH_CSRF_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  window.localStorage.removeItem(AUTH_CSRF_KEY)
  window.localStorage.removeItem(AUTH_PERSIST_KEY)
}

const persistAuth = ({ user, csrfToken }, mode) => {
  if (typeof window === 'undefined') {
    return
  }

  const primaryStorage = getStorageForMode(mode)
  const secondaryStorage = mode === PERSIST_LOCAL ? window.sessionStorage : window.localStorage

  if (!primaryStorage) {
    return
  }

  if (user) {
    primaryStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    primaryStorage.setItem(AUTH_CSRF_KEY, csrfToken || '')
    window.localStorage.setItem(AUTH_PERSIST_KEY, mode)
  } else {
    primaryStorage.removeItem(AUTH_USER_KEY)
    primaryStorage.removeItem(AUTH_CSRF_KEY)
    window.localStorage.removeItem(AUTH_PERSIST_KEY)
  }

  secondaryStorage.removeItem(AUTH_USER_KEY)
  secondaryStorage.removeItem(AUTH_CSRF_KEY)
}

const readInitialAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, csrfToken: '' }
  }

  const preferredMode = window.localStorage.getItem(AUTH_PERSIST_KEY)

  if (preferredMode === PERSIST_LOCAL) {
    const user = readStoredUser(window.localStorage)
    const csrfToken = readStorageValue(window.localStorage, AUTH_CSRF_KEY) || ''

    if (user) {
      return { user, csrfToken }
    }
  }

  const sessionUser = readStoredUser(window.sessionStorage)
  const sessionCsrf = readStorageValue(window.sessionStorage, AUTH_CSRF_KEY) || ''
  if (sessionUser) {
    return { user: sessionUser, csrfToken: sessionCsrf }
  }

  const localUser = readStoredUser(window.localStorage)
  const localCsrf = readStorageValue(window.localStorage, AUTH_CSRF_KEY) || ''
  if (localUser) {
    return { user: localUser, csrfToken: localCsrf }
  }

  return { user: null, csrfToken: '' }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readInitialAuth())
  const { user, csrfToken } = authState

  const applyAuthState = (payload, mode = PERSIST_SESSION) => {
    const nextAuthState = {
      user: payload?.user || null,
      csrfToken: payload?.csrfToken || '',
    }

    setAuthState(nextAuthState)
    persistAuth(nextAuthState, mode)
  }

  const clearAuthState = () => {
    setAuthState({ user: null, csrfToken: '' })
    clearPersistedAuth()
  }

  const register = async (formData) => {
    return registerUser(formData)
  }

  const login = async (credentials) => {
    const payload = await loginUser(credentials)
    const persistenceMode = credentials?.remember ? PERSIST_LOCAL : PERSIST_SESSION

    applyAuthState(payload, persistenceMode)

    return payload
  }

  const logout = async () => {
    try {
      if (csrfToken) {
        await logoutUser(csrfToken)
      }
    } finally {
      clearAuthState()
    }
  }

  const requestPasswordReset = async (email) => {
    return forgotPasswordRequest(email)
  }

  const confirmPasswordReset = async ({ token, newPassword }) => {
    const payload = await resetPasswordRequest(token, newPassword)

    applyAuthState(payload)

    return payload
  }

  const verifyEmail = async (token) => {
    const payload = await verifyUserEmail(token)

    applyAuthState(payload)

    return payload
  }

  const contextValue = {
    user,
    csrfToken,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    clearAuthState,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
