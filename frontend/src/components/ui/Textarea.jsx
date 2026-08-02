import { useId } from 'react'

function Textarea({
  id,
  label,
  helperText,
  error,
  disabled = false,
  className = '',
  rows = 4,
  ...props
}) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const helperTextId = helperText ? `${textareaId}-helper` : undefined
  const errorId = error ? `${textareaId}-error` : undefined
  const describedBy = [helperTextId, errorId].filter(Boolean).join(' ') || undefined

  let textareaStateClasses =
    'border-neutral-200 bg-surface-input text-foreground placeholder:text-neutral-500 focus:border-primary focus:ring-primary/20'

  if (error) {
    textareaStateClasses =
      'border-danger text-foreground placeholder:text-neutral-500 focus:border-danger focus:ring-danger/20 bg-surface-input'
  }

  if (disabled) {
    textareaStateClasses =
      'border-neutral-200 bg-surface-raised text-neutral-500 placeholder:text-neutral-400'
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={textareaId} className="text-sm font-medium text-heading">
          {label}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`min-h-28 w-full rounded-lg border px-3 py-2 text-body shadow-sm outline-none transition-colors duration-200 focus:ring-4 disabled:cursor-not-allowed ${textareaStateClasses} ${className}`}
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

export default Textarea
