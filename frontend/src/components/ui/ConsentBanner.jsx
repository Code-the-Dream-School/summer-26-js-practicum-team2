import { useState } from 'react'
import { getConsentPreference, setConsentPreference } from '../../utils/legalConsent.js'

export default function ConsentBanner() {
  const [consent, setConsent] = useState(() => getConsentPreference())

  const setPreference = (value) => {
    setConsentPreference(value)
    setConsent(value)
  }

  if (consent) return null

  return (
    <section
      aria-label="Analytics consent"
      className="border-t border-neutral-200 bg-surface-raised/80 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-2xl border border-neutral-200 bg-surface-app p-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-heading">Help us improve Sprout</p>
          <p className="mt-1 text-sm text-neutral-600">
            We use optional analytics to understand how learners use the app. You can accept or
            decline this at any time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreference('accepted')}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setPreference('declined')}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-neutral-300 bg-surface-app px-3.5 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
          >
            Decline
          </button>
        </div>
      </div>
    </section>
  )
}
