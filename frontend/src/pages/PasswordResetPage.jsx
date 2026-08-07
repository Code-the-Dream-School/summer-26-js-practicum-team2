import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ROUTES } from '../app/router/routes.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import useAuth from '../hooks/useAuth.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/

function PasswordResetPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { requestPasswordReset, confirmPasswordReset } = useAuth()
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const tokenFromQuery = queryParams.get('token') || ''

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isResetMode = Boolean(tokenFromQuery)

  const handleForgotPassword = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await requestPasswordReset(email)
      setSuccessMessage(response?.message || 'If your email exists, a reset link was sent.')
      setEmail('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to send reset instructions. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please complete both password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (newPassword.length < 8 || !PASSWORD_PATTERN.test(newPassword)) {
      setErrorMessage('Password must include uppercase, lowercase, number, and special character.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await confirmPasswordReset({
        token: tokenFromQuery,
        newPassword,
      })
      setSuccessMessage(response?.message || 'Password reset successful. You are now signed in.')
      setNewPassword('')
      setConfirmPassword('')
      navigate(ROUTES.HOME, {
        state: {
          toast: {
            type: 'success',
            message: response?.message || 'Password reset successful. You are now signed in.',
          },
        },
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to reset password. Please request a new reset link.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Password reset</p>
        <h1 className="text-h2 font-bold text-heading">
          {isResetMode ? 'Create a new password' : 'Reset your password'}
        </h1>
        <p className="text-small text-neutral-700">
          {isResetMode
            ? 'Enter and confirm a new password to complete the reset process.'
            : 'Enter your email and we will send password reset instructions.'}
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        {!isResetMode ? (
          <form onSubmit={handleForgotPassword} className="grid gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              required
            />

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Send reset link
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="grid gap-4">
            <Input
              label="New password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              helperText="Use at least 8 chars with upper/lowercase, 1 number, and 1 symbol."
              placeholder="Create a strong password"
              disabled={isSubmitting}
              required
            />

            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              disabled={isSubmitting}
              required
            />

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Reset password
            </Button>
          </form>
        )}

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-heading">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PasswordResetPage
