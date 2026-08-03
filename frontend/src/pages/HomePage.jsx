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

      <Link
        to="/dev/components"
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
      >
        &lt;View Component Library /&gt;
      </Link>
    </section>
  )
}

export default HomePage
