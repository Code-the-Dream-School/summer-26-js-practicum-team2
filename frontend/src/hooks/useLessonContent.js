import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLesson } from '../services/api.js'

export const DEFAULT_MODULE_ID = 'cashFlow'
export const DEFAULT_LESSON_ID = '1.1'

// Loads lesson content and the saved progress for that lesson from the backend.
export default function useLessonContent({ moduleId, lessonId, enabled = true }) {
  const [payload, setPayload] = useState(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState('')
  // Determine the resolved moduleId and lessonId, falling back to default values if not provided.
  const resolvedModuleId = moduleId || DEFAULT_MODULE_ID
  const resolvedLessonId = lessonId || DEFAULT_LESSON_ID
  // Fetches lesson content and progress from the backend API. If the hook is disabled, it resets the state to initial values.
  const fetchLesson = useCallback(async () => {
    if (!enabled) {
      setPayload(null)
      setIsLoading(false)
      setError('')
      return
    }
    // Set loading state and clear any previous errors before making the API request
    setIsLoading(true)
    setError('')

    try {
      // Fetch lesson content and progress from the backend API using the resolved moduleId and lessonId. If successful, update the payload state with the fetched data.
      const lessonPayload = await getLesson(resolvedModuleId, resolvedLessonId)
      setPayload(lessonPayload)
    } catch (requestError) {
      setPayload(null)
      // If the API request fails, set an error message to inform the user that the lesson could not be loaded.
      setError(requestError.message || 'We could not load this lesson right now.')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, resolvedLessonId, resolvedModuleId])

  useEffect(() => {
    // If the hook is enabled, fetch the lesson content and progress when the component mounts or when the resolved moduleId or lessonId changes.
    fetchLesson()
  }, [fetchLesson])
  // Memoize the returned object to prevent unnecessary re-renders in consuming components. The returned object includes the resolved moduleId, lessonId, fetched moduleData and lessonData, progress, loading state, error state, and a refresh function to re-fetch the lesson content.
  return useMemo(
    () => ({
      moduleId: resolvedModuleId,
      lessonId: resolvedLessonId,
      moduleData: payload?.moduleData ?? null,
      lessonData: payload?.lessonData ?? null,
      progress: payload?.progress ?? null,
      isLoading,
      error,
      refresh: fetchLesson,
    }),
    [error, fetchLesson, isLoading, payload, resolvedLessonId, resolvedModuleId],
  )
}
