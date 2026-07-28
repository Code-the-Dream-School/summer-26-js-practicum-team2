import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-emerald-700">404</p>

      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>

      <p className="mt-4 text-slate-600">The page you are looking for does not exist.</p>

      <Link
        className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        to="/"
      >
        Return home
      </Link>
    </section>
  )
}

export default NotFoundPage
