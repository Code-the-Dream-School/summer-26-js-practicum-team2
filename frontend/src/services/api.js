// API service for interacting with the backend.
// Base URL is determined by the VITE_API_BASE_URL environment variable, which can be set in the .env file.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
const USERS_BASE_PATH = `${API_BASE_URL}/api/v1/users`
const DASHBOARD_BASE_PATH = `${API_BASE_URL}/api/v1/dashboard`

// Helper function to make API requests to the backend.
async function apiRequest(path, options = {}) {
  const { method = 'GET', body, csrfToken, headers = {}, basePath = USERS_BASE_PATH } = options

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (csrfToken && ['POST', 'PATCH', 'PUT', 'DELETE', 'CONNECT'].includes(method.toUpperCase())) {
    requestHeaders['X-CSRF-TOKEN'] = csrfToken
  }

  const response = await fetch(`${basePath}${path}`, {
    method,
    credentials: 'include',
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })
  // Checks if the response is JSON and parses it if it is, otherwise returns null
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  // If the response is not OK, throw an error
  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed. Please try again.')
    error.status = response.status
    error.errors = Array.isArray(payload?.errors) ? payload.errors : []
    throw error
  }
  return payload
}

export const registerUser = (formData) =>
  apiRequest('/register', {
    method: 'POST',
    body: formData,
  })

export const loginUser = (credentials) =>
  apiRequest('/login', {
    method: 'POST',
    body: credentials,
  })

export const logoutUser = (csrfToken) =>
  apiRequest('/logout', {
    method: 'POST',
    csrfToken,
  })

export const verifyUserEmail = (token) => apiRequest(`/verify?token=${encodeURIComponent(token)}`)

export const forgotPasswordRequest = (email) =>
  apiRequest('/forgot-password', {
    method: 'POST',
    body: { email },
  })

export const resetPasswordRequest = (token, newPassword) =>
  apiRequest('/reset-password', {
    method: 'POST',
    body: { token, newPassword },
  })

export const getDashboard = () =>
  apiRequest('', {
    method: 'GET',
    basePath: DASHBOARD_BASE_PATH,
  })

export const notifyDashboardProgressChanged = () => {
  window.dispatchEvent(new Event('sprout:progress-updated'))
}

export const trackDashboardEvent = async ({ type, csrfToken, ...payload }) => {
  const response = await apiRequest('/events', {
    method: 'POST',
    csrfToken,
    body: {
      type,
      ...payload,
    },
    basePath: DASHBOARD_BASE_PATH,
  })

  notifyDashboardProgressChanged()
  return response
}
