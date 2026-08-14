import { useState } from "react";
import Button from "../../../shared/Button/Button.component.jsx";
import {
  getConsentPreference,
  setConsentPreference,
} from "../../../../../redo/frontend/src/utils/legalConsent.js";

export default function ConsentBanner() {
  // Read the saved preference once so the banner stays hidden after a choice.
  const [consent, setConsent] = useState(() => getConsentPreference());

  const setPreference = (value) => {
    // Persist the choice and update local state so the banner disappears immediately.
    setConsentPreference(value);
    setConsent(value);
  };

  if (consent) return null;

  return (
    <section
      aria-label="Analytics consent"
      className="border-t border-neutral-200 bg-surface-raised/80 px-4 py-4 shadow-sm backdrop-blur sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-2xl border border-neutral-200 bg-surface-app p-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-heading">
            Help us improve Sprout
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            We use optional analytics to understand how learners use the app.
            You can accept or decline this at any time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPreference("accepted")}>Accept</Button>
          <Button variant="secondary" onClick={() => setPreference("declined")}>
            Decline
          </Button>
        </div>
      </div>
    </section>
  );
}
