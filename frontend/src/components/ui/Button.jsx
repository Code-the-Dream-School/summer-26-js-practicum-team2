export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;
  const styles = {
    primary:
      "border border-primary bg-primary text-on-primary shadow-sm hover:bg-primary-hover focus:border-primary focus:ring-primary/20",
    secondary:
      "border border-neutral-300 bg-surface-app text-heading shadow-sm hover:bg-surface-raised focus:border-primary focus:ring-primary/20",
    ghost:
      "border border-transparent bg-transparent text-primary shadow-none hover:bg-surface-inset focus:border-primary focus:ring-primary/20",
    circleCompleted:
      "border border-neutral-300 bg-surface-app text-heading shadow-sm hover:bg-surface-raised focus:border-primary focus:ring-primary/20",
    circleCurrent:
      "border border-primary bg-primary text-on-primary shadow-sm hover:bg-primary-hover focus:border-primary focus:ring-primary/20",
    circleDisabled:
      "border border-primary bg-primary text-on-primary shadow-sm hover:bg-primary-hover focus:border-primary focus:ring-primary/20",
  };

  const circleClass =
    "border h-25 w-25 p-0 rounded-full flex items-center justify-center disabled:opacity-50";

  const baseClass =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold leading-none transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={
        variant === "circleCompleted" || variant === "circleCurrent" || variant === "circleDisabled"
          ? `${circleClass} ${styles[variant]}`
          : `${baseClass} ${styles[variant] || styles.primary} ${className}`.trim()
      }
      {...props}
    >
      {loading && <span aria-hidden="true" />}
      <span>{loading ? "Loading..." : children}</span>
    </button>
  );
}
