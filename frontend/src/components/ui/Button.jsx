function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  let buttonStyle = 'bg-primary text-on-primary hover:bg-primary-hover shadow-md rounded-lg'

  if (variant === 'secondary') {
    buttonStyle =
      'bg-surface-input text-heading border border-neutral-200 hover:bg-surface-raised rounded-lg shadow-sm'
  }

  if (variant === 'ghost') {
    buttonStyle = 'bg-transparent text-heading hover:bg-surface-raised rounded-lg'
  }

  return (
    <button
      type={type}
      className={`px-3 py-2 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default Button
