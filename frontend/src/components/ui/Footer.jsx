import { Link } from 'react-router'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
  {
    label: 'GitHub',
    href: 'https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2',
  },
  { label: 'Contact', href: '/contact' },
  { label: 'Help', href: '/help' },
]

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-surface-app/90 px-4 py-8 text-sm text-neutral-600 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-lg px-3 py-2 font-semibold text-heading transition-colors hover:bg-surface-inset hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="max-w-3xl rounded-2xl border border-neutral-200 bg-surface-raised px-4 py-3 text-sm leading-6 text-neutral-700 shadow-sm">
          Disclaimer: Sprout is an educational product and not financial advice. Use the lessons to
          build knowledge, but consult a qualified professional for personal financial decisions.
        </p>
      </div>
    </footer>
  )
}

export default Footer
