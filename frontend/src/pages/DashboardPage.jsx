import { Link } from 'react-router'
import DashboardHero from '../components/dashboard/DashboardHero.jsx'
import RecentActivityCard from '../components/dashboard/RecentActivityCard.jsx'
import UnitProgressRow from '../components/dashboard/UnitProgressRow.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { ROUTES } from '../app/router/routes.js'
import useAuth from '../hooks/useAuth.js'
import useDashboardData from '../hooks/useDashboardData.js'

function DashboardSkeleton() {
  return (
    <section className="space-y-6" aria-hidden="true">
      <Skeleton className="h-56 rounded-2xl border border-neutral-200 bg-surface-raised" />
      <Skeleton className="h-36 rounded-2xl border border-neutral-200 bg-surface-raised" />
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
        <Skeleton className="h-20 rounded-2xl border border-neutral-200 bg-surface-raised" />
      </div>
    </section>
  )
}

function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const { dashboard, isLoading, error } = useDashboardData({
    userId: user?.id,
    isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon="🔐"
        title="Sign in to view your dashboard"
        message="Track your progress, streaks, and next lesson after you sign in."
        action={
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
          >
            Go to sign in
          </Link>
        }
      />
    )
  }

  if (isLoading && !dashboard) {
    return <DashboardSkeleton />
  }

  if (error && !dashboard) {
    return (
      <EmptyState
        icon="⚠️"
        title="We could not load your dashboard"
        message={error}
        action={
          <Link
            to={ROUTES.HOME}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
          >
            Back to home
          </Link>
        }
      />
    )
  }

  const { hero, nextAction, units = [], recentActivity = [] } = dashboard || {}
  const totalLessons = units.reduce((sum, unit) => sum + unit.totalLessons, 0)
  const completedLessons = units.reduce((sum, unit) => sum + unit.completedLessons, 0)
  const hasNoProgress = completedLessons === 0

  return (
    <section className="space-y-6">
      <DashboardHero hero={hero} />

      <Card className="space-y-3">
        <p className="text-small font-semibold uppercase tracking-wide text-primary">
          Recommended next
        </p>
        <h2 className="font-heading text-h4 font-bold text-heading">{nextAction?.title}</h2>
        <p className="text-neutral-600">{nextAction?.description}</p>
        <Link
          to={nextAction?.href || '/lessons'}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
        >
          {nextAction?.ctaLabel || 'Continue learning'}
        </Link>
      </Card>

      {hasNoProgress ? (
        <EmptyState
          icon="🌱"
          title="Welcome to your progress dashboard"
          message="Ready to start? Begin with Budgeting Basics"
          action={
            <Link
              to={nextAction?.href || '/lessons/budgeting-basics-1'}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
            >
              Begin with Budgeting Basics
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <header className="space-y-1">
            <h2 className="font-heading text-h4 font-bold text-heading">Unit progress</h2>
            <p className="text-small text-neutral-600">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </header>

          <div className="space-y-3">
            {units.map((unit) => (
              <UnitProgressRow key={unit.id} unit={unit} />
            ))}
          </div>

          <RecentActivityCard activity={recentActivity} />
        </div>
      )}
    </section>
  )
}

export default Dashboard
