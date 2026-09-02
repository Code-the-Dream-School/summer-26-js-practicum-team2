import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import GlossaryModal from "../../../features/learn/GlossaryModal/GlossaryModal.component.jsx";
import glossaryIcon from "../../../assets/glossary_icon.svg";
//import glossaryData from "../../../../../shared/content/budgeting.json";
import defaultContent from "../../../../../shared/content/budgeting.json";

const footerNavLinks = [
  { label: "Home", to: "/" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  {
    label: "GitHub",
    href: "https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2",
  },
];

//route prefixes for glossary access
const allowedGlossaryPaths = ["/dashboard", "/onboarding", "/learn"];

export default function Footer({ currentGlossary = [], currentWorksCited = [] }) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isGlossaryHidden, setIsGlossaryHidden] = useState(false);
  const location = useLocation();

  const showGlossary = allowedGlossaryPaths.some((path) => location.pathname.startsWith(path));

  const glossaryList =
    currentGlossary && currentGlossary.length > 0
      ? currentGlossary
      : defaultContent?.glossary || [];

  const worksCitedList =
    currentWorksCited && currentWorksCited.length > 0
      ? currentGlossary
      : defaultContent?.worksCited || [];

  const copyrightYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-surface-app/90 px-4 py-8 text-sm text-neutral-600 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {footerNavLinks.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2 font-semibold text-heading transition-colors hover:bg-surface-inset hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className="rounded-lg px-3 py-2 font-semibold text-heading transition-colors hover:bg-surface-inset hover:text-primary"
              >
                {link.label}
              </NavLink>
            ),
          )}
          {/* Glossary Link (accessible on allowed pages*/}
          {showGlossary && (
            <button
              type="button"
              onClick={
                isGlossaryHidden ? () => setIsGlossaryHidden(false) : () => setIsGlossaryOpen(true)
              }
              className="rounded-lg px-3 py-2 font-semibold text-heading transition-colors hover:bg-surface-inset hover:text-primary"
            >
              Glossary & References
            </button>
          )}
        </nav>

        <p className="max-w-3xl rounded-2xl border border-neutral-200 bg-surface-raised px-4 py-3 text-sm leading-6 text-neutral-700 shadow-sm">
          Disclaimer: Sprout is an educational product and not financial advice. Use the lessons to
          build knowledge, but consult a qualified professional for personal financial decisions.
        </p>

        {/* Floating Button */}
        {showGlossary && !isGlossaryHidden && (
          <div className="fixed top-1/2 right-4 z-50 -translate-y-1/2 flex items-center gap-1 rounded-lg border-2 border-heading bg-surface-raised p-0.5 shadow-md transition-all hover:bg-accent hover:shadow-lg  sm:right-6 sm:p-1">
            {/* Glossary button */}

            <button
              type="button"
              onClick={() => setIsGlossaryOpen(true)}
              aria-label="Open Glossary and References"
              className="inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-heading focus:outline-none focus:ring-2 focus:ring-focus sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <img src={glossaryIcon} alt="" aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" />
              <span></span>
            </button>

            {/*Hide Glossary Button*/}
            <button
              type="button"
              onClick={() => setIsGlossaryHidden(true)}
              aria-label="Hide glossary and references button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-heading transition-colors hover:bg-surface-inset hover:text-danger focus:outline-none sm:h-7 sm:w-7 sm:text-sm"
              title="Hide glossary"
            >
              x
            </button>
          </div>
        )}

        {showGlossary && (
          <GlossaryModal
            isOpen={isGlossaryOpen}
            onClose={() => setIsGlossaryOpen(false)}
            glossary={glossaryList}
            worksCited={worksCitedList}
          />
        )}

        <p className="text-xs text-neutral-400">
          &copy; {copyrightYear} Sprout — Code the Dream Summer Practicum '26 | Counting Cents and
          Making Sense.
        </p>
      </div>
    </footer>
  );
}
