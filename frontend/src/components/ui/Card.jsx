export default function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  selected = false,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...props
}) {
  const variantClasses = {
    default: 'border-neutral-200 bg-surface-raised shadow-sm',
    quiz: 'border-neutral-200 bg-[#e8faf5] shadow-md',
    choice: 'border-neutral-200 bg-white shadow-sm',
    success: 'border-success bg-[#ddf5e9] shadow-sm',
    danger: 'border-danger bg-[#ffe0df] shadow-sm',
  }

  let stateClasses = variantClasses[variant] || variantClasses.default

  if (interactive) {
    stateClasses = `${stateClasses} transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md`
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
      className={`rounded-2xl border p-5 text-foreground ${interactive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-app' : ''} ${stateClasses} ${className}`.trim()}
      {...a11yProps}
      {...props}
    >
      {children}
    </article>
  )
}
