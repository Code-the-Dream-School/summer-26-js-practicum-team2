export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  const styles = {
    primary: 'bg-black text-white',
    secondary: 'border',
    ghost: 'bg-transparent',
  }

  const baseClass = 'px-3 py-2 rounded'
  const disabledClass = 'cursor-not-allowed opacity-50'

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClass} ${styles[variant] || styles.primary} ${isDisabled ? disabledClass : ''}`.trim()}
      {...props}
    >
      {loading && <span aria-hidden="true" />}
      <span>{loading ? 'Loading...' : children}</span>
    </button>
  )
}
