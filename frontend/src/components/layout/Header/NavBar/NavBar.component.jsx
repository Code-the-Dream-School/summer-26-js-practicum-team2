import { useState } from "react";
import { NavLink } from "react-router";
import Button from "../../../shared/Button/Button.component.jsx";

const primaryNavLinks = [{ label: "Home", href: "/" }];

export default function NavBar({
  signedIn = false,
  avatarLabel = "A",
  xp = 0,
  streak = 0,
  onLogout,
  isSigningOut = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const authNavLinks = signedIn
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Learn", href: "/learn" },
      ]
    : [];

  const combinedNavLinks = [...primaryNavLinks, ...authNavLinks];

  const mobileNavLinks = signedIn
    ? [...combinedNavLinks, { label: "Profile", href: "/profile" }]
    : [
        ...combinedNavLinks,
        { label: "Login", href: "/login" },
        { label: "Signup", href: "/register" },
      ];

  return (
    <nav aria-label="Primary navigation">
      <menu className="hidden items-center gap-1 md:flex">
        {combinedNavLinks.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("http") ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                to={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
              >
                {link.label}
              </NavLink>
            )}
          </li>
        ))}

        {!signedIn ? (
          <>
            <li>
              <Button as={NavLink} to="/login" variant="secondary">
                Login
              </Button>
            </li>
            <li>
              <Button as={NavLink} to="/register" variant="primary">
                Signup
              </Button>
            </li>
          </>
        ) : (
          <>
            <li>
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-surface-raised px-3 py-2 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-surface-inset font-semibold text-heading">
                  <NavLink to="/profile">{avatarLabel}</NavLink>
                </span>
                <span className="text-sm font-semibold text-heading">{xp} XP</span>
                <span className="text-sm text-neutral-600">{streak} day streak</span>
              </div>
            </li>

            <li>
              <Button
                type="button"
                onClick={onLogout}
                disabled={isSigningOut}
                variant="ghost"
                className="px-3 py-2"
              >
                {isSigningOut ? "Signing out..." : "Logout"}
              </Button>
            </li>
          </>
        )}
      </menu>

      <Button
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        variant="secondary"
        className="h-11 w-11 rounded-lg p-0 text-2xl md:hidden"
      >
        {isOpen ? (
          "x"
        ) : (
          <span aria-hidden="true" className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        )}
      </Button>

      {isOpen ? (
        <div className="border-t border-neutral-200 bg-surface-app px-4 py-3 md:hidden">
          <ul className="space-y-2">
            {mobileNavLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-inset"
                  >
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
            {signedIn ? (
              <li>
                <Button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout?.();
                  }}
                  disabled={isSigningOut}
                  variant="ghost"
                  className="w-full justify-start px-3 py-2"
                >
                  {isSigningOut ? "Signing out..." : "Logout"}
                </Button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
