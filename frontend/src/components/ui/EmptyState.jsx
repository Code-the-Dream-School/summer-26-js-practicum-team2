export default function EmptyState({
  icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <section
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-surface-raised px-6 py-12 text-center ${className}`}
    >
      {/* Optional icon */}
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-surface-inset text-2xl text-primary">
          {icon}
        </div>
      )}

      {/* Optional title */}
      {title && (
        <h2 className="font-heading text-h4 font-bold text-heading">
          {title}
        </h2>
      )}

      {/* Main message */}
      <div className="mt-2 max-w-md text-neutral-600">
        {message}
      </div>

      {/* Optional action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </section>
  )
}