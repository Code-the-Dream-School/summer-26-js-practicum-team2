import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { ROUTES } from "../app/router/routes";
import { registerSchema } from "../features/auth/schemas";
import { pickPlaceholderIdentity } from "../features/auth/placeholderIdentities";
import Card from "../shared/Card/Card.component";
import Input from "../shared/Input/Input.component";
import Button from "../shared/Button/Button.component";

export default function RegisterPage() {
  const { register: registerUser } = useAuthContext();
  const [isRegistered, setIsRegistered] = useState(false);
  const placeholder = useMemo(() => pickPlaceholderIdentity(), []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      tos: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      setIsRegistered(true);
    } catch (err) {
      // Only the server can know an email is already taken.
      if (err.status === 409) {
        setError("email", { message: err.message });
      } else {
        setError("root", { message: err.message });
      }
    }
  };

  if (isRegistered) {
    return (
      <div className="mx-auto max-w-md py-8">
        <Card>
          <h1 className="font-heading text-h2 font-bold text-heading">Check your email</h1>
          <p className="mt-2 text-neutral-600">
            We sent a verification link. Open it to finish setting up your account.
          </p>
          <Link to={ROUTES.LOGIN} className="mt-4 inline-block text-primary underline">
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Create account</p>
        <h1 className="mt-1 font-heading text-h2 font-bold text-heading">Join Sprout</h1>
        <p className="mt-2 text-small text-neutral-700">
          Create an account to save your progress and keep a record of your lessons.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-4">
          <Input
            label="Name"
            placeholder={placeholder.name}
            disabled={isSubmitting}
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder={placeholder.email}
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            helperText="At least 8 characters with upper and lower case, a number, and a symbol."
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-surface-app p-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded border-neutral-300 accent-primary"
              {...register("tos")}
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
          {errors.tos && <p className="text-sm font-medium text-danger">{errors.tos.message}</p>}

          {errors.root && (
            <p role="alert" className="text-sm font-medium text-danger">
              {errors.root.message}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button type="submit" loading={isSubmitting}>
              Create account
            </Button>
            <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-primary hover:underline">
              Already have an account?
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
