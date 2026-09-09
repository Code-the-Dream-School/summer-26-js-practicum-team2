import { useEffect, useState } from "react";
import { getOAuthProviders, getOAuthUrl } from "../../services/api";
import Button from "../Button/Button.component";

export default function OAuthButtons({ next }) {
  const [providers, setProviders] = useState(null);

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

  const availableProviders = [
    ["google", "Google"],
    ["github", "GitHub"],
  ].filter(([provider]) => providers?.[provider]);

  if (!availableProviders.length) return null;

  return (
    <>
      <div className="my-6 flex items-center gap-3 text-small text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" />
        or
        <span className="h-px flex-1 bg-neutral-200" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {availableProviders.map(([provider, label]) => (
            <Button
              key={provider}
              as="a"
              href={getOAuthUrl(provider, true, next)}
              variant="secondary"
            >
              Continue with {label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
