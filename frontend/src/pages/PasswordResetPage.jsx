import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { ROUTES } from "../app/router/routes";
import { confirmResetSchema, requestResetSchema } from "../features/auth/schemas";
import { getPasswordHelperText } from "../features/auth/passwordHelperText";
import Card from "../shared/Card/Card.component";
import Input from "../shared/Input/Input.component";
import Button from "../shared/Button/Button.component";

function RequestResetForm() {
  const { requestPasswordReset } = useAuthContext();
  // Show a success message back to the user after the reset email request is sent.
  const [notice, setNotice] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }) => {
    try {
      // Some backend responses include a dev-only reset URL to make local testing easier.
      const response = await requestPasswordReset(email);
      setNotice(response?.devPasswordReset?.resetUrl ?? response?.message);
    } catch (err) {
      setError("root", { message: err.message });
    }
  };

  return (
    <>
      <h1 className="font-heading text-h2 font-bold text-heading">Reset your password</h1>
      <p className="mt-1 text-small text-neutral-600">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register("email")}
        />

        {errors.root && (
          <p role="alert" className="text-small font-medium text-danger">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      {notice && (
        <p
          role="status"
          className="mt-4 break-all rounded-xl bg-primary-alt/30 p-3 text-small text-heading"
        >
          {notice}
        </p>
      )}
    </>
  );
}

function ConfirmResetForm({ token }) {
  const { confirmPasswordReset } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: { password: "" },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });
  const passwordHelperText = getPasswordHelperText(passwordValue);

  const onSubmit = async ({ password }) => {
    try {
      await confirmPasswordReset(token, password);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError("root", { message: err.message });
    }
  };

  return (
    <>
      <h1 className="font-heading text-h2 font-bold text-heading">Choose a new password</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          helperText={passwordHelperText}
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register("password")}
        />

        {errors.root && (
          <p role="alert" className="text-small font-medium text-danger">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </>
  );
}

export default function PasswordResetPage() {
  const [params] = useSearchParams();
  const token = params.get("token");

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        {token ? <ConfirmResetForm token={token} /> : <RequestResetForm />}

        <div className="mt-4 text-small">
          <Link to={ROUTES.LOGIN} className="text-primary underline">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}
