import { Link } from 'react-router'
import { ROUTES } from '../app/router/routes.js'

function PasswordResetPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Password reset</p>
        <h1 className="text-h2 font-bold text-heading">Reset your password</h1>
        <p className="text-small text-neutral-700">
          This page is still under development. Feature coming soon.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          Check back soon. We will add reset instructions in a future update.
        </p>

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
