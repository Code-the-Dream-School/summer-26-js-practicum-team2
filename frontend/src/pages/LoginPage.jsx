import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { ROUTES } from '../app/router/routes.js'
import useAuth from '../hooks/useAuth.js'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formValues, setFormValues] = useState({ email: '', password: '', rememberMe: false })
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [bannerError, setBannerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(values) {
    const nextErrors = { email: '', password: '' }

    if (!values.email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!values.email.includes('@') || !values.email.includes('.')) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!values.password) {
      nextErrors.password = 'Please enter your password.'
    }

    return nextErrors
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear current server or form messages while user is editing.
    if (bannerError) {
      setBannerError('')
    }

    if (successMessage) {
      setSuccessMessage('')
    }

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  function handleBlur(event) {
    const { name } = event.target
    const nextErrors = validate(formValues)
    setFieldErrors((current) => ({ ...current, [name]: nextErrors[name] }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBannerError('')
    setSuccessMessage('')

    const nextErrors = validate(formValues)
    setFieldErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) {
      setBannerError('Please fix the highlighted fields and try again.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: formValues.email,
        password: formValues.password,
        remember: formValues.rememberMe,
      })
      setFormValues({ email: '', password: '', rememberMe: false })
      setFieldErrors({ email: '', password: '' })
      setSuccessMessage('Signed in successfully.')
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      setBannerError(error.message || 'We could not sign you in. Please try again.')

      if (
        Array.isArray(error.errors) &&
        error.errors.some((item) => item.toLowerCase().includes('email'))
      ) {
        setFieldErrors((current) => ({
          ...current,
          email: 'Please check this email.',
        }))
      }

      if (
        Array.isArray(error.errors) &&
        error.errors.some((item) => item.toLowerCase().includes('password'))
      ) {
        setFieldErrors((current) => ({
          ...current,
          password: 'Please check your password.',
        }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Welcome back</p>
        <h1 className="text-h2 font-bold text-heading">Sign in to Sprout</h1>
        <p className="text-small text-neutral-700">
          Access your lessons, progress, and saved preferences.
        </p>
      </header>

      <form
        method="post"
        action={ROUTES.LOGIN}
        autoComplete="on"
        noValidate
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldErrors.email}
            placeholder="you@example.com"
            disabled={isSubmitting}
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={fieldErrors.password}
            placeholder="Your password"
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formValues.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            Remember me
          </label>

          <Link
            to={ROUTES.PASSWORD_RESET}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {bannerError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          >
            {bannerError}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-heading"
          >
            {successMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Sign in
          </Button>
          <Link to="/register" className="text-sm font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </section>
  )
}

export default LoginPage
