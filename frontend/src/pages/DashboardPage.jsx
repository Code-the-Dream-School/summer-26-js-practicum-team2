import { Link, Navigate } from 'react-router'
import useAuth from '../hooks/useAuth.js'
import DashboardHero from '../components/dashboard/DashboardHero.jsx'
import RecentActivityCard from '../components/dashboard/RecentActivityCard.jsx'
import UnitProgressRow from '../components/dashboard/UnitProgressRow.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { ROUTES } from '../app/router/routes.js'

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
    // If the user is not authenticated, redirect them to the login page. This ensures that only authenticated users can access the dashboard.
    return <Navigate to={ROUTES.LOGIN} replace />
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
          <Button as={Link} to={ROUTES.HOME} variant="primary" className="px-5 py-2.5">
            Back to home
          </Button>
        }
      />
    )
  }

  const { hero, nextAction, units = [], recentActivity = [] } = dashboard || {}
  const totalLessons = units.reduce((sum, unit) => sum + unit.totalLessons, 0)
  // Calculate the total number of learning activities by summing up the totalMicroLessons or totalLessons for each unit. This gives a comprehensive view of the user's overall progress across all units.
  const totalLearningActivities = units.reduce(
    (sum, unit) => sum + (unit.totalMicroLessons || unit.totalLessons),
    0,
  )
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
        <Button
          as={Link}
          to={nextAction?.href || '/lessons'}
          variant="primary"
          className="px-5 py-2.5"
        >
          {nextAction?.ctaLabel || 'Continue learning'}
        </Button>
      </Card>

      {hasNoProgress ? (
        <EmptyState
          icon="🌱"
          title="Welcome to your progress dashboard"
          message="Ready to start? Begin with Budgeting Basics"
          action={
            <Button
              as={Link}
              to={nextAction?.href || '/learn/cashFlow/1.1'}
              variant="primary"
              className="px-5 py-2.5"
            >
              Begin with Budgeting Basics
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <header className="space-y-1">
            <h2 className="font-heading text-h4 font-bold text-heading">Unit progress</h2>
            <p className="text-small text-neutral-600">
              {completedLessons} of {totalLessons} lesson units completed ({totalLearningActivities}{' '}
              learning activities total)
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
