import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDashboard } from '../services/api.js'

// Sets default cache Time to Live to 30 seconds.
const DASHBOARD_CACHE_TTL_MS = 30 * 1000

const getCacheKey = (userId) => `sprout.dashboard.${userId}`

const readCachedDashboard = (userId) => {
  // We use sessionStorage to cache dashboard data for the current browser session. 
  const stored = window.sessionStorage.getItem(getCacheKey(userId))
  if (!stored) {
    return null
  }

  try {
    // Cache entries are stored as { payload, expiresAt }.
    const cached = JSON.parse(stored)
    // Return cached data only while it is still fresh.
    return cached.expiresAt > Date.now() ? cached.payload : null
  } catch {
    // Ignore malformed cache values and treat as a cache miss.
    return null
  }
}

const cacheDashboard = (userId, payload) => {
  window.sessionStorage.setItem(
    getCacheKey(userId),
    JSON.stringify({
      payload,
      // Expiration is evaluated on read to keep writes simple.
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
      // Reset local state when there is no authenticated user context.
      if (!isAuthenticated || !userId) {
        setDashboard(null)
        setIsLoading(false)
        setError('')
        return
      }

      // Use session cache unless a forced refresh is requested.
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
    // Initial load (or when auth/user context changes via fetchDashboard deps).
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    const handleProgressUpdate = () => {
      // Progress updates can change dashboard stats, so invalidate and refetch.
      window.sessionStorage.removeItem(getCacheKey(userId))
      fetchDashboard({ force: true })
    }

    window.addEventListener('sprout:progress-updated', handleProgressUpdate)
    return () => window.removeEventListener('sprout:progress-updated', handleProgressUpdate)
  }, [fetchDashboard, userId])

  const refresh = useCallback(() => {
    // Public refresh always bypasses cache.
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
