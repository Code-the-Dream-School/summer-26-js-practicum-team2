export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading
  const styles = {
    primary:
      'border border-primary bg-primary text-on-primary shadow-sm hover:bg-primary-hover focus:border-primary focus:ring-primary/20',
    secondary:
      'border border-neutral-300 bg-surface-app text-heading shadow-sm hover:bg-surface-raised focus:border-primary focus:ring-primary/20',
    ghost:
      'border border-transparent bg-transparent text-primary shadow-none hover:bg-surface-inset focus:border-primary focus:ring-primary/20',
    quiz: 'border border-primary bg-primary text-on-primary shadow-[0_8px_16px_rgba(16,86,71,0.2)] hover:bg-primary-hover focus:border-primary focus:ring-primary/20',
    quizSecondary:
      'border border-neutral-300 bg-white text-heading shadow-[0_6px_12px_rgba(6,30,25,0.08)] hover:bg-surface-raised focus:border-primary focus:ring-primary/20',
  }

  const sizeClasses = {
    md: 'min-h-10 px-3.5 py-2',

    circle: 'h-25 w-25 p-0 rounded-full flex items-center justify-center',
  }

  const baseClass =
    'inline-flex items-center justify-center gap-2 text-sm font-semibold leading-none transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${baseClass} ${sizeClasses[size]} ${styles[variant] || styles.primary} ${className}`.trim()}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{loading ? 'Loading...' : children}</span>
    </button>
  )
}
