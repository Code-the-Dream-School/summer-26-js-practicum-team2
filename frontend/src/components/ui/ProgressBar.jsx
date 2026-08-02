function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const toneStyles = {
  primary: {
    linearFill: 'bg-primary',
    circularRing: 'text-primary',
  },
  success: {
    linearFill: 'bg-success',
    circularRing: 'text-success',
  },
  warning: {
    linearFill: 'bg-warning',
    circularRing: 'text-warning',
  },
  danger: {
    linearFill: 'bg-danger',
    circularRing: 'text-danger',
  },
}

const circularSizes = {
  sm: 56,
  md: 76,
  lg: 96,
}

export default function ProgressBar({
  value,
  min = 0,
  max = 100,
  variant = 'linear',
  size = 'md',
  tone = 'primary',
  showValue = false,
  label,
  className = '',
}) {
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) && max > safeMin ? max : 100
  const rawValue = Number.isFinite(value) ? value : safeMin
  const progressValue = clamp(rawValue, safeMin, safeMax)
  const percent = ((progressValue - safeMin) / (safeMax - safeMin)) * 100
  const roundedPercent = Math.round(percent)
  const progressLabel = label || 'Progress'
  const selectedTone = toneStyles[tone] || toneStyles.primary

  if (variant === 'circular') {
    const resolvedSize = circularSizes[size] || circularSizes.md
    const stroke = 8
    const radius = (resolvedSize - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (percent / 100) * circumference

    return (
      <div
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={safeMin}
        aria-valuemax={safeMax}
        aria-valuenow={progressValue}
        aria-valuetext={`${roundedPercent}%`}
        className={`relative inline-flex items-center justify-center ${className}`.trim()}
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        <svg
          width={resolvedSize}
          height={resolvedSize}
          viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
        >
          <circle
            cx={resolvedSize / 2}
            cy={resolvedSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200"
            strokeWidth={stroke}
          />
          <circle
            cx={resolvedSize / 2}
            cy={resolvedSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={selectedTone.circularRing}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${resolvedSize / 2} ${resolvedSize / 2})`}
          />
        </svg>
        <span className="absolute text-sm font-semibold text-heading">{roundedPercent}%</span>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={safeMin}
          aria-valuemax={safeMax}
          aria-valuenow={progressValue}
          aria-valuetext={`${roundedPercent}%`}
          className="h-2.5 w-full overflow-hidden rounded-lg bg-neutral-200"
        >
          <div
            className={`h-full rounded-lg transition-[width] duration-300 ${selectedTone.linearFill}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {showValue ? (
          <span className="text-sm font-semibold text-heading">{roundedPercent}%</span>
        ) : null}
      </div>
    </div>
  )
}
