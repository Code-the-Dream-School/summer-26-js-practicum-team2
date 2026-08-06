import { Link, useLocation, useNavigate } from 'react-router'
import Toast from '../components/ui/Toast.jsx'

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = location.state?.toast || null

  const closeToast = () => {
    navigate(location.pathname, { replace: true, state: null })
  }

  return (
    <section className="space-y-6">
      <Toast
        isOpen={Boolean(toast?.message)}
        message={toast?.message || ''}
        onClose={closeToast}
        duration={4500}
        variant={toast?.type === 'success' ? 'success' : 'default'}
      />

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
