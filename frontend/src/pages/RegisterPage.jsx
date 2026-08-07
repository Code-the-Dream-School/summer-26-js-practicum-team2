import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import useAuth from '../hooks/useAuth.js'
import {
  setConsentPreference,
  getConsentPreference,
  trackAnalyticsEvent,
} from '../utils/legalConsent.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/

// Just a list of random names and emails and function to randomly select one. This is just for fun and to laughs.
const namesAndEmails = [
  {
    name: 'Richie Richness',
    email: 'swimmingincoins@goldvault.com',
  },
  {
    name: 'Penny Pincher',
    email: 'everycentcounts@couponclipper.org',
  },
  {
    name: 'Count Cashula',
    email: 'vampireminspending@midnightbanking.net',
  },
  {
    name: 'Midas Touch',
    email: 'everythingigold@solidwealth.io',
  },
  {
    name: 'Justin Case',
    email: 'rainydayfund@emergencyonly.com',
  },
  {
    name: 'Bill Paymore',
    email: 'too-many-subscriptions@brokemail.com',
  },
  {
    name: 'Paige Turner',
    email: 'readingthecharts@finliteracy.edu',
  },
  {
    name: 'Max Balance',
    email: 'alwaysmaxedout@savingshero.com',
  },
  {
    name: 'Fiona Finance',
    email: 'fiona@expertcapital.com',
  },
  {
    name: 'Benny Bucks',
    email: 'venmo-me@peer2peer.xyz',
  },
  {
    name: 'Sally Saver',
    email: 'retirementgoals2050@nestegg.org',
  },
  {
    name: 'Charlie Ching',
    email: 'cha-ching@moneycomic.net',
  },
]

const selectRandomNameAndEmail = () =>
  namesAndEmails[Math.floor(Math.random() * namesAndEmails.length)]

function RegisterPage() {
  const { register } = useAuth()
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [summaryErrors, setSummaryErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const selectedUser = useMemo(() => selectRandomNameAndEmail(), [])

  const validateForm = (values, tosChecked) => {
    const nextErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = 'Please enter your name.'
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Please enter an email address.'
    } else if (!EMAIL_PATTERN.test(values.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!values.password) {
      nextErrors.password = 'Please enter a password.'
    } else if (values.password.length < 8 || !PASSWORD_PATTERN.test(values.password)) {
      nextErrors.password =
        'Password must include uppercase, lowercase, number, and special character.'
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!tosChecked) {
      nextErrors.agreed = 'You must accept the Terms of Service and Privacy Policy.'
    }

    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormValues((current) => {
      const nextValues = { ...current, [name]: value }

      if (touched[name]) {
        const nextErrors = validateForm(nextValues, agreed)
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          [name]: nextErrors[name],
          ...(name === 'password' ? { confirmPassword: nextErrors.confirmPassword } : {}),
        }))
      }

      return nextValues
    })
  }

  const handleBlur = (event) => {
    const { name } = event.target
    setTouched((current) => ({ ...current, [name]: true }))

    const nextErrors = validateForm(formValues, agreed)
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: nextErrors[name],
      ...(name === 'password' ? { confirmPassword: nextErrors.confirmPassword } : {}),
    }))
  }

  const handleAgreementChange = (event) => {
    const isChecked = event.target.checked
    setAgreed(isChecked)

    setTouched((current) => ({ ...current, agreed: true }))
    setFieldErrors((currentErrors) => {
      if (isChecked) {
        return { ...currentErrors, agreed: undefined }
      }

      return {
        ...currentErrors,
        agreed: 'You must accept the Terms of Service and Privacy Policy.',
      }
    })

    setConsentPreference(isChecked ? 'accepted' : 'rejected')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')

    const nextErrors = validateForm(formValues, agreed)
    setFieldErrors(nextErrors)
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreed: true,
    })

    if (Object.keys(nextErrors).length > 0) {
      setSummaryErrors(Object.values(nextErrors))
      setError('Please fix the issues below and try again.')
      return
    }

    setSummaryErrors([])
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        ...formValues,
        tos: agreed,
      })
      trackAnalyticsEvent('signup_submitted', { email: formValues.email })
      setSuccess('Registration successful. Please check your email for verification.')
      setFormValues({ name: '', email: '', password: '', confirmPassword: '' })
      setAgreed(false)
      setTouched({})
      setFieldErrors({})
      setConsentPreference('rejected')
    } catch (submitError) {
      if (Array.isArray(submitError.errors) && submitError.errors.length > 0) {
        setSummaryErrors(submitError.errors)
      }
      setError(submitError.message || 'Unable to register right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled = isSubmitting

  const consentPreference = getConsentPreference()

  const inlineErrors = {
    name: touched.name ? fieldErrors.name : undefined,
    email: touched.email ? fieldErrors.email : undefined,
    password: touched.password ? fieldErrors.password : undefined,
    confirmPassword: touched.confirmPassword ? fieldErrors.confirmPassword : undefined,
    agreed: touched.agreed ? fieldErrors.agreed : undefined,
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Create account</p>
        <h1 className="text-h2 font-bold text-heading">Join Sprout</h1>
        <p className="text-small text-neutral-700">
          Create an account to save your progress and keep a record of your lessons.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm"
      >
        <div className="grid gap-4">
          <Input
            label="Name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={inlineErrors.name}
            placeholder={selectedUser.name}
            disabled={isSubmitting}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={inlineErrors.email}
            placeholder={selectedUser.email}
            disabled={isSubmitting}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={inlineErrors.password}
            helperText="Use at least 8 chars with upper/lowercase, 1 number, and 1 symbol."
            placeholder="Create a password"
            disabled={isSubmitting}
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={formValues.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={inlineErrors.confirmPassword}
            placeholder="Re-enter your password"
            disabled={isSubmitting}
            required
          />
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-xl border border-neutral-200 bg-surface-app p-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={handleAgreementChange}
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          <span>
            I agree to the{' '}
            <Link
              to="/terms"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {inlineErrors.agreed ? (
          <p className="mt-2 text-sm font-medium text-danger">{inlineErrors.agreed}</p>
        ) : null}

        {summaryErrors.length > 0 ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          >
            <p className="font-semibold">Please correct the following:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {summaryErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 rounded-xl border border-neutral-200 bg-surface-app p-3 text-sm text-neutral-700">
          <p className="font-semibold text-heading">Privacy notice</p>
          <p className="mt-1">
            Analytics are currently {consentPreference === 'accepted' ? 'enabled' : 'disabled'} for
            this demo.
          </p>
          <p className="mt-2 rounded-lg border border-neutral-200 bg-surface-raised p-2 text-xs leading-5 text-neutral-700">
            Disclaimer: Sprout is for educational use and is not financial advice.
          </p>
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm font-semibold text-emerald-700">{success}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitDisabled} loading={isSubmitting}>
            Create account
          </Button>
          <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
            Already have an account?
          </Link>
        </div>
      </form>
    </section>
  )
}

export default RegisterPage
