// helper function to clamp a value between a minimum and maximum
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const circularSizeMap = {
  sm: 72,
  md: 108,
  lg: 144,
}

const circularStrokeMap = {
  sm: 8,
  md: 10,
  lg: 12,
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

export default function ProgressBar({
  value,
  min = 0,
  max = 100,
  variant = 'linear',
  size = 'md',
  strokeWidth,
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
    const sizeKey = typeof size === 'string' ? size : null
    const resolvedSize =
      typeof size === 'number' ? size : circularSizeMap[sizeKey] || circularSizeMap.md
    const resolvedStrokeWidth =
      typeof strokeWidth === 'number'
        ? strokeWidth
        : circularStrokeMap[sizeKey] || circularStrokeMap.md

    const radius = (resolvedSize - resolvedStrokeWidth) / 2
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
          aria-hidden="true"
        >
          <circle
            cx={resolvedSize / 2}
            cy={resolvedSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200"
            strokeWidth={resolvedStrokeWidth}
          />
          <circle
            cx={resolvedSize / 2}
            cy={resolvedSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={selectedTone.circularRing}
            strokeWidth={resolvedStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${resolvedSize / 2} ${resolvedSize / 2})`}
          />
        </svg>

        <span className="absolute font-semibold text-heading">{roundedPercent}%</span>
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
          className="h-3 w-full overflow-hidden rounded-pill bg-neutral-200"
        >
          <div
            className={`h-full rounded-pill transition-[width] duration-300 ${selectedTone.linearFill}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {showValue ? (
          <span className="text-small font-semibold text-heading">{roundedPercent}%</span>
        ) : null}
      </div>
    </div>
  )
}
