const VARIANT_CLASSES = {
  default: 'bg-surface-inset text-heading',
  success: 'bg-success text-on-primary',
  warning: 'bg-warning text-neutral-800',
}

function Badge({ variant = 'default', className = '', children, ...rest }) {
  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-pill',
        'px-2.5 py-0.5',
        'text-caption font-semibold leading-tight',
        'whitespace-nowrap select-none',
        variantClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
