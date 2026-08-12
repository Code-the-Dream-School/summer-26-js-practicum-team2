import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDashboard } from '../services/api.js'

const DASHBOARD_CACHE_TTL_MS = 30 * 1000

const getCacheKey = (userId) => `sprout.dashboard.${userId}`

const readCachedDashboard = (userId) => {
  const stored = window.sessionStorage.getItem(getCacheKey(userId))
  if (!stored) {
    return null
  }

  try {
    const cached = JSON.parse(stored)
    return cached.expiresAt > Date.now() ? cached.payload : null
  } catch {
    return null
  }
}

const cacheDashboard = (userId, payload) => {
  window.sessionStorage.setItem(
    getCacheKey(userId),
    JSON.stringify({
      payload,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    }),
  )
}

export default function useDashboardData({ userId, isAuthenticated }) {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(
    async ({ force = false } = {}) => {
      if (!isAuthenticated || !userId) {
        setDashboard(null)
        setIsLoading(false)
        setError('')
        return
      }

      if (!force) {
        const cachedDashboard = readCachedDashboard(userId)
        if (cachedDashboard) {
          setDashboard(cachedDashboard)
          setIsLoading(false)
          setError('')
          return cachedDashboard
        }
      }

      setIsLoading(true)
      setError('')

      try {
        const payload = await getDashboard()
        setDashboard(payload)
        cacheDashboard(userId, payload)
        return payload
      } catch (requestError) {
        setError(requestError.message || 'We could not load your dashboard right now.')
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, userId],
  )

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    const handleProgressUpdate = () => {
      window.sessionStorage.removeItem(getCacheKey(userId))
      fetchDashboard({ force: true })
    }

    window.addEventListener('sprout:progress-updated', handleProgressUpdate)
    return () => window.removeEventListener('sprout:progress-updated', handleProgressUpdate)
  }, [fetchDashboard, userId])

  const refresh = useCallback(() => {
    return fetchDashboard({ force: true })
  }, [fetchDashboard])

  return useMemo(
    () => ({
      dashboard,
      isLoading,
      error,
      refresh,
    }),
    [dashboard, error, isLoading, refresh],
  )
}
