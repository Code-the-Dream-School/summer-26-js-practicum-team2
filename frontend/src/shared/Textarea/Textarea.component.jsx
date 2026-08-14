import { useFieldA11y } from "../../hooks/useFieldA11y";

export default function Textarea({
  id,
  label,
  helperText,
  error,
  disabled = false,
  className = "",
  ...props
}) {
  const { fieldId, helperTextId, errorId, describedBy, stateClass } = useFieldA11y({
    id,
    helperText,
    error,
    disabled,
  });

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-semibold text-heading">
          {label}
        </label>
      ) : null}

      <textarea
        id={fieldId}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed ${stateClass} ${className}`}
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
  );
}
