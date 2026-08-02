export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading
  const styles = {
    primary:
      'border border-primary bg-primary text-on-primary hover:bg-primary-hover focus:border-primary focus:ring-primary/20',
    secondary:
      'border border-primary bg-surface-app text-heading hover:bg-surface-raised focus:border-primary focus:ring-primary/20',
    ghost:
      'border border-transparent bg-transparent text-primary hover:bg-surface-inset focus:border-primary focus:ring-primary/20',
  }

  const baseClass =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 font-semibold transition-colors duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${baseClass} ${styles[variant] || styles.primary} ${className}`.trim()}
      {...props}
    >
      {loading && <span aria-hidden="true" />}
      <span>{loading ? 'Loading...' : children}</span>
    </button>
  )
}
