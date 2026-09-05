import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ROUTES } from "../../app/router/routes";
import { getOAuthProviders, getOAuthUrl } from "../../services/api";
import Button from "../Button/Button.component";

export default function OAuthButtons() {
  const [providers, setProviders] = useState(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [consentError, setConsentError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    getOAuthProviders()
      .then((availableProviders) => {
        if (isCurrent) setProviders(availableProviders);
      })
      .catch(() => {
        if (isCurrent) setProviders({ google: false, github: false });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleProviderClick = (event) => {
    if (tosAccepted) return;

    event.preventDefault();
    setConsentError("Please agree to the Terms of Service and Privacy Policy to continue.");
  };

  const availableProviders = [
    ["google", "Google"],
    ["github", "GitHub"],
  ].filter(([provider]) => providers?.[provider]);

  if (!availableProviders.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-start gap-3 text-small text-neutral-700">
        <input
          type="checkbox"
          aria-label="Agree to Terms for social sign-in"
          checked={tosAccepted}
          onChange={(event) => {
            setTosAccepted(event.target.checked);
            setConsentError(null);
          }}
          className="mt-1 h-4 w-4 border-neutral-300 accent-primary"
        />
        <span>
          I agree to the{" "}
          <Link to={ROUTES.TERMS} className="font-semibold text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to={ROUTES.PRIVACY} className="font-semibold text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {consentError && (
        <p role="alert" className="text-small font-medium text-danger">
          {consentError}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {availableProviders.map(([provider, label]) => (
          <Button
            key={provider}
            as="a"
            href={getOAuthUrl(provider, tosAccepted)}
            variant="secondary"
            aria-disabled={!tosAccepted || undefined}
            onClick={handleProviderClick}
            className={!tosAccepted ? "cursor-not-allowed opacity-50" : ""}
          >
            Continue with {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
