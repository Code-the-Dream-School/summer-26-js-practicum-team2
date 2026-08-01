import { useEffect, useState } from 'react'
import logo from '../../assets/logo.svg'

// Declares menu links for the navigation bar
const menuLinks = [
  { label: 'About', href: '/about' },
  { label: 'Privacy & Terms', href: '/privacy' },
  { label: 'GitHub', href: 'https://github.com/Code-the-Dream-School' },
  { label: 'Contact', href: '/contact' },
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/register', primary: true },
]

export default function NavBar() {
  // State to track whether the mobile menu is open
  const [isOpen, setIsOpen] = useState(false)
  // Listen for esc key to close the hamburger menu
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    // Attach the event listener for the escape key
    window.addEventListener('keydown', handleEscape)

    return () => {
      // Clean up the event listener for the escape key
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <nav
      aria-label="Primary navigation"
      className="border-b border-neutral-200 bg-surface-app shadow-sm"
    >
      {/* Main navigation */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" aria-label="Sprout home">
          <img src={logo} alt="" className="w-32 lg:w-36" />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-2 md:flex">
          {/* Map through the menu links and render them as list items */}
          {menuLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                // Open external links in a new tab
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className={
                  link.primary
                    ? 'rounded-md bg-primary px-4 py-2 font-semibold text-on-primary hover:bg-primary-hover'
                    : 'rounded-md px-3 py-2 font-semibold text-heading hover:bg-surface-inset'
                }
              >
                {link.label}

                {link.href.startsWith('http') && (
                  <span className="sr-only"> (opens in a new tab)</span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 border-2 border-heading md:hidden"
        >
          <span className="h-0.5 w-6 bg-current" />
          <span className="h-0.5 w-6 bg-current" />
          <span className="h-0.5 w-6 bg-current" />
        </button>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-surface-app md:hidden">
          <div className="flex h-20 items-center justify-between border-b border-neutral-200 px-4">
            <a href="/" onClick={() => setIsOpen(false)}>
              <img src={logo} alt="Sprout" className="w-32" />
            </a>

            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsOpen(false)}
              className="text-3xl text-heading"
            >
              ×
            </button>
          </div>

          <ul>
            {menuLinks.map((link) => (
              // Render each menu link as a list item in the mobile navigation
              <li key={link.label} className="border-b border-neutral-300">
                <a
                  href={link.href}
                  // Open external links in a new tab
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="block py-4 text-center text-lg font-bold text-heading hover:bg-surface-raised"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
