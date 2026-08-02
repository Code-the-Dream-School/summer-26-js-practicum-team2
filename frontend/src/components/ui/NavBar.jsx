import { useState } from 'react'
import logo from '../../assets/logo.svg'

const primaryLinks = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/dev/components' },
  { label: 'About', href: '/about' },
  { label: 'Privacy & Terms', href: '/privacy' },
  {
    label: 'GitHub',
    href: 'https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2',
  },
  { label: 'Contact', href: '/contact' },
  { label: 'Help', href: '/help' },
]

export default function NavBar({
  signedIn = false,
  avatarLabel = 'A',
  xp = 120,
  streak = 4,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)

  const authLinks = signedIn
    ? [
        { label: 'Dashboard', href: '/' },
        { label: 'Profile', href: '/profile' },
      ]
    : [
        { label: 'Login', href: '/login' },
        { label: 'Signup', href: '/register' },
      ]

  const mobileLinks = [...primaryLinks, ...authLinks]

  return (
    <nav
      aria-label="Primary navigation"
      className={`border-b border-neutral-200 bg-surface-app/95 shadow-sm backdrop-blur ${className}`.trim()}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="Sprout home">
          <img src={logo} alt="" className="w-28 sm:w-32 lg:w-36" />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
              >
                {link.label}
              </a>
            </li>
          ))}

          {!signedIn ? (
            <>
              <li>
                <a
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Signup
                </a>
              </li>
            </>
          ) : (
            <li>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-surface-raised px-3 py-2 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-surface-inset font-semibold text-heading">
                  {avatarLabel}
                </span>
                <span className="text-sm font-semibold text-heading">{xp} XP</span>
                <span className="text-sm text-neutral-600">{streak} day streak</span>
              </div>
            </li>
          )}
        </ul>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-surface-raised text-2xl text-heading shadow-sm md:hidden"
        >
          {isOpen ? 'x' : '='}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-neutral-200 bg-surface-app px-4 py-3 md:hidden">
          <ul className="space-y-2">
            {mobileLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  )
}
