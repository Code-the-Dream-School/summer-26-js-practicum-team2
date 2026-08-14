import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthContext.jsx";
import { ROUTES } from "../app/router/routes.js";
import { loginSchema } from "../features/auth/schemas.js";
import Card from "../shared/Card/Card.component.jsx";
import Input from "../shared/Input/Input.component.jsx";
import Button from "../shared/Button/Button.component.jsx";

export default function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values) => {
    try {
      await login(values);
      // Return users to the protected page they originally requested, when available.
      const next = new URLSearchParams(location.search).get("next");
      navigate(next || ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      // Display authentication failures in the form rather than leaving the page.
      setError("root", { message: err.message });
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <h1 className="font-heading text-h2 font-bold text-heading">Login</h1>
        <p className="mt-1 text-small text-neutral-600">Log in to keep growing your streak.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <label className="flex items-center gap-2 text-small text-foreground">
            {/* The auth context uses this preference to determine session duration. */}
            <input type="checkbox" className="accent-primary" {...register("remember")} />
            Keep me signed in for 30 days
          </label>

          {errors.root && (
            <p role="alert" className="text-small font-medium text-danger">
              {errors.root.message}
            </p>
          )}

          <Button type="submit" loading={isSubmitting}>
            Log in
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-small">
          <Link to={ROUTES.REGISTER} className="text-primary underline hover:text-primary-hover">
            Create an account
          </Link>
          <Link
            to={ROUTES.PASSWORD_RESET}
            className="text-primary underline hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
      </Card>
    </div>
  );
}
