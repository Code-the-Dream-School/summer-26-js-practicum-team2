export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  as: Component = 'button',
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
    quiz: 'border border-primary bg-primary text-on-primary shadow-[var(--shadow-quiz)] hover:bg-primary-hover focus:border-primary focus:ring-primary/20',
    quizSecondary:
      'border border-neutral-300 bg-surface-input text-heading shadow-[var(--shadow-quiz-secondary)] hover:bg-surface-raised focus:border-primary focus:ring-primary/20',
    circleCompleted:
      'border-[4px] border-circle-border bg-circle-completed text-circle-text shadow-[var(--shadow-circle-completed)] hover:bg-circle-hover-completed focus:border-circle-border focus:ring-circle-border/20',
    circleCurrent:
      'border-[4px] border-circle-border-current bg-circle-current text-circle-text shadow-[var(--shadow-circle-current)] hover:bg-circle-hover-current focus:border-circle-border-current focus:ring-circle-border-current/10',
    circleDisabled:
      'border-[4px] border-circle-border bg-circle-disabled text-circle-text shadow-[var(--shadow-circle-completed)] hover:bg-circle-hover-completed focus:border-circle-border focus:ring-circle-border/20',
  }

  const circleClass =
    'h-[4.5rem] w-[4.5rem] rounded-full p-0 flex items-center justify-center disabled:opacity-50'

  const baseClass =
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold leading-none transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50'

  const resolvedClassName =
    variant === 'circleCompleted' || variant === 'circleCurrent' || variant === 'circleDisabled'
      ? `${circleClass} ${styles[variant]} ${className}`.trim()
      : `${baseClass} ${styles[variant] || styles.primary} ${className}`.trim()

  const sharedProps = {
    className: resolvedClassName,
    'aria-busy': loading || undefined,
  }

  if (Component === 'button') {
    sharedProps.type = type
    sharedProps.disabled = isDisabled
  } else {
    sharedProps['aria-disabled'] = isDisabled || undefined
  }

  return (
    <Component {...sharedProps} {...props}>
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{loading ? 'Loading...' : children}</span>
    </Component>
  )
}
