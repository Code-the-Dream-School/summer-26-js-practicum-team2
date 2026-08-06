import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ROUTES } from '../app/router/routes.js'
import useAuth from '../hooks/useAuth.js'

// This cache and in-flight map are used to ensure that the email verification process is only performed once per token
const verificationCache = new Map()
const verificationInFlight = new Map()

// This function verifies the email token only once, caching the result for future calls with the same token.
const verifyTokenOnce = async (token, verifyEmail) => {
  if (verificationCache.has(token)) {
    return verificationCache.get(token)
  }

  if (verificationInFlight.has(token)) {
    return verificationInFlight.get(token)
  }

  // Start the verification process and store the promise in the in-flight map
  const pendingRequest = verifyEmail(token)
    .then((response) => {
      const result = {
        ok: true,
        message: response?.message || 'Email verified successfully. You can now sign in.',
      }
      verificationCache.set(token, result)
      return result
    })
    .catch((error) => {
      const result = {
        ok: false,
        message: error?.message || 'Verification failed. The token may be invalid or expired.',
      }
      verificationCache.set(token, result)
      return result
    })
    .finally(() => {
      verificationInFlight.delete(token)
    })

  verificationInFlight.set(token, pendingRequest)
  return pendingRequest
}

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()
  const location = useLocation()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email now...')
  // Extract the token from the query parameters in the URL
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const token = queryParams.get('token') || ''
  const hasToken = Boolean(token)

  useEffect(() => {
    let isCancelled = false
    // If there's no token, we don't need to verify anything, so we can exit early.
    if (!hasToken) {
      return () => {
        isCancelled = true
      }
    }
    // Immediately invoke an async function to handle the email verification process.
    ;(async () => {
      const result = await verifyTokenOnce(token, verifyEmail)

      if (isCancelled) {
        return
      }
      if (result.ok) {
        // If the verification is successful, we set the status to 'success' and navigate to the home page after a short delay.
        setStatus('success')
        setTimeout(() => {
          navigate(ROUTES.HOME, {
            replace: true,
            state: {
              toast: {
                // We pass a success message to the home page to be displayed in a toast notification.
                type: 'success',
                message: result.message,
              },
            },
          })
        }, 1000)
      } else {
        setStatus('error')
      }

      setMessage(result.message)
    })()

    return () => {
      isCancelled = true
    }
  }, [hasToken, navigate, token, verifyEmail])
  // Determine the current state of the verification process to conditionally render the UI.
  const isLoading = hasToken && status === 'loading'
  const isSuccess = hasToken && status === 'success'
  const isTokenMissing = !hasToken
  const errorMessage = isTokenMissing
    ? 'Verification token is missing. Please use the link from your email.'
    : message

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Email verification
        </p>
        <h1 className="text-h2 font-bold text-heading">Verify your account</h1>
        <p className="text-small text-neutral-700">
          Confirming your email helps secure your account and unlock sign in.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-neutral-200 bg-surface-app p-4 text-sm text-neutral-700"
          >
            {message}
          </div>
        ) : null}

        {isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            {message}
          </div>
        ) : null}

        {!isLoading && !isSuccess ? (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isSuccess ? null : (
            <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-primary hover:underline">
              Go to sign in
            </Link>
          )}
          {isSuccess ? (
            <Link to={ROUTES.HOME} className="text-sm font-semibold text-primary hover:underline">
              Continue to home
            </Link>
          ) : null}
          {!isSuccess ? (
            <Link
              to={ROUTES.REGISTER}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Create account again
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default VerifyEmailPage
