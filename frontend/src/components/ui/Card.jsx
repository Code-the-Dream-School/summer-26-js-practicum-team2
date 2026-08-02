export default function Card({
  children,
  className = '',
  interactive = false,
  selected = false,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...props
}) {
  let stateClasses = 'border-neutral-200 bg-surface-raised shadow-sm'

  if (interactive) {
    stateClasses =
      'border-neutral-200 bg-surface-raised shadow-sm transition-colors duration-200 hover:border-primary-hover hover:shadow-md'
  }

  if (selected) {
    stateClasses = 'border-primary bg-surface-inset shadow-md'
  }

  const isClickable = interactive && typeof onClick === 'function'

  const handleKeyDown = (event) => {
    onKeyDown?.(event)

    if (event.defaultPrevented || !isClickable) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(event)
    }
  }

  const a11yProps = interactive
    ? {
        role: role ?? (isClickable ? 'button' : undefined),
        tabIndex: tabIndex ?? 0,
        onKeyDown: handleKeyDown,
        'aria-pressed': isClickable ? selected : undefined,
      }
    : {
        role,
        tabIndex,
        onKeyDown,
      }

  return (
    <article
      onClick={onClick}
      className={`rounded-lg border p-4 text-foreground ${interactive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-app' : ''} ${stateClasses} ${className}`.trim()}
      {...a11yProps}
      {...props}
    >
      {children}
    </article>
  )
}
