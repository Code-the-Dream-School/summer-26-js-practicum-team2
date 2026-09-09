import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { ROUTES } from "../app/router/routes";
import { getPostLoginDestination } from "../utils/postLoginRouting";
import Card from "../shared/Card/Card.component";
import Spinner from "../shared/Spinner/Spinner.component";

// Landing page after a Google/GitHub redirect: the session cookie is already set by the backend, so this just fetches the user to hydrate client-side auth state.
export default function OAuthCallbackPage() {
  const { completeOAuthLogin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const user = await completeOAuthLogin();
        const next = new URLSearchParams(location.search).get("next");
        const destination = getPostLoginDestination({ user, next });
        navigate(destination, { replace: true });
      } catch (err) {
        setError(err.message || "Sign-in failed.");
      }
    })();
  }, [completeOAuthLogin, navigate, location.search]);

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="text-center">
        {error ? (
          <>
            <h1 className="font-heading text-h2 font-bold text-heading">Sign-in didn't work</h1>
            <p className="mt-2 text-small text-danger">{error}</p>
            <Link to={ROUTES.LOGIN} className="mt-4 inline-block text-primary underline">
              Back to login
            </Link>
          </>
        ) : (
          <Spinner label="Signing you in" />
        )}
      </Card>
    </div>
  );
}
