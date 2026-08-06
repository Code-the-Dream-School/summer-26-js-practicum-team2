import { Link } from 'react-router'

function HomePage() {
  return (
    <section className="space-y-6">
      {/* Page introduction */}
      <p className="text-small font-semibold uppercase tracking-wide text-primary">
        Financial education platform
      </p>

      <h1 className="text-h1 font-bold tracking-tight text-heading">Financial Literacy</h1>

      <p className="max-w-2xl leading-normal text-foreground">
        Learn how to manage money, create a budget, build savings, and make informed financial
        decisions.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/quizzes/budgeting-cash-flow"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
        >
          Start budgeting quiz
        </Link>

        <Link
          to="/dev/components"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-surface-app px-5 py-2.5 font-semibold text-heading hover:bg-surface-raised"
        >
          View component library
        </Link>
      </div>
    </section>
  )
}

export default HomePage
