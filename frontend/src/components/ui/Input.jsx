import { useId } from 'react'

function Input({
  id,
  label,
  helperText,
  error,
  disabled = false,
  className = '',
  type = 'text',
  ...props
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperTextId = helperText ? `${inputId}-helper` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [helperTextId, errorId].filter(Boolean).join(' ') || undefined

  let inputStateClasses =
    'border-neutral-200 bg-surface-input text-foreground placeholder:text-neutral-500 focus:border-primary focus:ring-primary/20'

  if (error) {
    inputStateClasses =
      'border-danger text-foreground placeholder:text-neutral-500 focus:border-danger focus:ring-danger/20 bg-surface-input'
  }

  if (disabled) {
    inputStateClasses =
      'border-neutral-200 bg-surface-raised text-neutral-500 placeholder:text-neutral-400'
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-heading">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        type={type}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border px-3 py-2 text-body shadow-sm outline-none transition-colors duration-200 focus:ring-4 disabled:cursor-not-allowed ${inputStateClasses} ${className}`}
        {...props}
      />

      {helperText ? (
        <p id={helperTextId} className="text-sm text-neutral-600">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default Input
