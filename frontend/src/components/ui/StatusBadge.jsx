const variants = {
  default: 'bg-surface-inset text-heading',
  success: 'bg-success text-on-primary',
  warning: 'bg-warning text-neutral-800',
}

export default function StatusBadge({ variant = 'default', className = '', children, ...props }) {
  const styles = variants[variant] || variants.default

  return (
    <span
      {...props}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-2.5 py-0.5 text-caption font-semibold leading-tight select-none ${styles} ${className}`}
    >
      {children}
    </span>
  )
}
