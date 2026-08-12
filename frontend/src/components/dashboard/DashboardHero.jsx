import { Link } from 'react-router'
import Badge from '../ui/Badge.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

const fallbackHero = {
  state: 'new_user',
  displayName: 'Learner',
  greeting: 'Welcome back',
  statusText: 'Start with one short lesson and get your first win today.',
  streak: {
    currentDays: 0,
    helperText: 'Start your streak with a lesson.',
  },
  dailyGoal: {
    current: 0,
    target: 2,
    label: '0 / 2 lessons',
    isMet: false,
  },
  primaryAction: {
    label: 'Start Budgeting Basics',
    href: '/learn/cashFlow/1.1',
  },
}

const formatStreakLabel = (days) => {
  if (days === 1) {
    return '1 day'
  }

  return `${days} days`
}

export default function DashboardHero({ hero }) {
  const resolvedHero = hero || fallbackHero
  const streakDays = Number.isFinite(resolvedHero?.streak?.currentDays)
    ? resolvedHero.streak.currentDays
    : 0
  const goalCurrent = Number.isFinite(resolvedHero?.dailyGoal?.current)
    ? resolvedHero.dailyGoal.current
    : 0
  const goalTarget = Number.isFinite(resolvedHero?.dailyGoal?.target)
    ? resolvedHero.dailyGoal.target
    : 1
  const goalBadgeText = resolvedHero?.dailyGoal?.isMet ? 'Goal met' : 'In progress'
  const ctaLabel = resolvedHero?.primaryAction?.label || 'Continue learning'
  const ctaHref = resolvedHero?.primaryAction?.href || '/learn'

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface-raised p-5 text-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start">
        <div>
          <h1 className="font-heading text-h2 font-bold text-heading">{resolvedHero.greeting}</h1>
          <p className="mt-2 max-w-2xl text-neutral-700">{resolvedHero.statusText}</p>

          <Link
            to={ctaHref}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-1">
          <article className="rounded-xl border border-neutral-200 bg-surface-inset p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Streak</p>
            <p className="mt-1 text-lg font-bold text-heading">{formatStreakLabel(streakDays)}</p>
            <p className="mt-1 text-small text-neutral-600">{resolvedHero?.streak?.helperText}</p>
          </article>

          <article className="rounded-xl border border-neutral-200 bg-surface-inset p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                Today's goal
              </p>
              <Badge
                mode="pill"
                variant={resolvedHero?.dailyGoal?.isMet ? 'success' : 'default'}
                label={goalBadgeText}
                className="px-2 py-1 text-xs"
              />
            </div>
            <p className="mt-1 font-semibold text-heading">{resolvedHero?.dailyGoal?.label}</p>
            <ProgressBar
              value={goalCurrent}
              min={0}
              max={goalTarget}
              label="Daily goal progress"
              className="mt-3"
            />
          </article>
        </div>
      </div>

      {resolvedHero.state === 'all_caught_up' ? (
        <p className="mt-4 text-small text-neutral-600">
          Today's activity is already counted in your streak.
        </p>
      ) : null}
    </section>
  )
}
