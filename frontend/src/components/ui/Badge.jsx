import Card from './Card.jsx'

const toneClasses = {
  default: {
    pill: 'border-neutral-300 bg-surface-input text-foreground',
    card: 'border-neutral-300 bg-surface-raised',
    icon: 'border-neutral-300 bg-surface-app text-heading',
  },
  success: {
    pill: 'border-success bg-success text-on-primary',
    card: 'border-success bg-surface-raised',
    icon: 'border-success bg-success text-on-primary',
  },
  warning: {
    pill: 'border-warning bg-warning text-heading',
    card: 'border-warning bg-surface-raised',
    icon: 'border-warning bg-warning text-heading',
  },
}

function DefaultBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none">
      <path
        d="M12 3 14.6 8.3l5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Badge({
  variant = 'default',
  mode = 'pill',
  label,
  title,
  course = 'Course completion',
  icon,
  earned = true,
  earnedDate,
  className = '',
  children,
  ...props
}) {
  const selectedTone = toneClasses[variant] || toneClasses.default
  const badgeTitle = title || label || children

  if (mode === 'pill') {
    return (
      <span
        className={`inline-flex items-center rounded-pill border px-3 py-1 text-sm font-semibold ${selectedTone.pill} ${className}`.trim()}
        {...props}
      >
        {badgeTitle}
      </span>
    )
  }

  const isEarned = earned

  return (
    <Card
      {...props}
      aria-label={`${typeof badgeTitle === 'string' ? badgeTitle : 'Course'} badge, ${
        isEarned ? 'earned' : 'locked'
      }`}
      className={`flex w-full max-w-md items-center gap-4 ${selectedTone.card} ${!isEarned ? 'opacity-70' : ''} ${className}`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-pill border-2 ${selectedTone.icon}`}
      >
        <span aria-hidden="true">{icon || <DefaultBadgeIcon />}</span>
      </div>

      <div className="min-w-0">
        <p className="text-caption font-semibold uppercase tracking-wide text-primary">
          {isEarned ? 'Badge earned' : 'Locked badge'}
        </p>
        <h3 className="mt-1 font-heading text-h4 font-bold text-heading">{badgeTitle}</h3>
        <p className="mt-1 text-small text-neutral-600">{course}</p>
        {isEarned && earnedDate ? (
          <p className="mt-2 text-caption font-medium text-neutral-500">Earned {earnedDate}</p>
        ) : null}
      </div>
    </Card>
  )
}
