import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { ROUTES } from "../app/router/routes";
import Card from "../shared/Card/Card.component";
import Spinner from "../shared/Spinner/Spinner.component";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { verifyEmail } = useAuthContext();
  const navigate = useNavigate();

  const token = params.get("token");
  const [status, setStatus] = useState(token ? "pending" : "error");
  const [error, setError] = useState(token ? null : "Missing verification token.");

  // The token is single-use, so StrictMode's double-invoked effect must not spend it twice.
  const ranRef = useRef(false);
  const redirectRef = useRef(null);

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        await verifyEmail(token);
        setStatus("done");
        redirectRef.current = setTimeout(() => navigate(ROUTES.DASHBOARD, { replace: true }), 1200);
      } catch (err) {
        setStatus("error");
        setError(err.message || "Verification failed.");
      }
    })();
  }, [token, verifyEmail, navigate]);

  useEffect(() => () => clearTimeout(redirectRef.current), []);

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="text-center">
        {status === "pending" && <Spinner label="Verifying your email" />}
        {status === "done" && (
          <>
            <h1 className="font-heading text-h2 font-bold text-heading">You're in!</h1>
            <p className="mt-2 text-small text-neutral-600">Redirecting to your dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-heading text-h2 font-bold text-heading">
              We couldn't verify that link
            </h1>
            <p role="alert" className="mt-2 text-small text-danger">
              {error}
            </p>
            <Link to={ROUTES.LOGIN} className="mt-4 inline-block text-primary underline">
              Back to login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
