import { useCallback, useEffect, useMemo, useState } from 'react'
import { getDashboard } from '../services/api.js'

export default function useDashboardData({ userId, isAuthenticated }) {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setDashboard(null)
      setIsLoading(false)
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const payload = await getDashboard()
      setDashboard(payload)
    } catch (requestError) {
      setError(requestError.message || 'We could not load your dashboard right now.')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, userId])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const refresh = useCallback(() => {
    return fetchDashboard()
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
