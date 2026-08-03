import { useState } from 'react'
import { Link } from 'react-router'
import DashboardHero from '../components/dashboard/DashboardHero.jsx'
import RecentActivityCard from '../components/dashboard/RecentActivityCard.jsx'
import UnitProgressRow from '../components/dashboard/UnitProgressRow.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

// Just some mockup data for the dashboard. Will come from the API in the future
const dashboardData = {
  nextAction: {
    title: 'Start Budgeting Basics',
    description: 'Ready to start? Begin with Budgeting Basics',
    ctaLabel: 'Start lesson',
    href: '/lessons',
  },
  units: [
    {
      id: 'budgeting',
      name: 'Budgeting Basics',
      icon: '💡',
      completedLessons: 0,
      totalLessons: 4,
      progressPercent: 0,
    },
    {
      id: 'saving',
      name: 'Smart Saving',
      icon: '🏦',
      completedLessons: 0,
      totalLessons: 4,
      progressPercent: 0,
    },
    {
      id: 'credit',
      name: 'Credit Confidence',
      icon: '💳',
      completedLessons: 0,
      totalLessons: 3,
      progressPercent: 0,
    },
  ],
  recentActivity: [],
}

function Dashboard() {
  // Randomly select a name and status for the user.
  //  This is just for fun and to make the dashboard feel more alive without actual data flowing yet
  const [{ name, status, streak }] = useState(() => {
    const names = ['Berenice', 'Hector', 'Kristen', 'Maryzabeth', 'Mario', 'Mikey']
    const statuses = ['new', 'in-progress', 'complete']

    return {
      name: names[Math.floor(Math.random() * names.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      streak: Math.floor(Math.random() * 100),
    }
  })

  // Destructure the mockup data for easier access
  const { nextAction, units, recentActivity } = dashboardData
  // Calculate the overall progress percentage across all units
  const totalLessons = units.reduce((sum, unit) => sum + unit.totalLessons, 0)
  // Calculate the total completed lessons across all units
  const completedLessons = units.reduce((sum, unit) => sum + unit.completedLessons, 0)
  // Calculate the overall progress percentage across all units
  const overallPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)

  return (
    <section className="space-y-6">
      <DashboardHero
        name={name}
        status={status}
        streak={streak}
        goal={nextAction.title}
        progress={overallPercent}
        ctaLabel={nextAction.ctaLabel}
        ctaTo={nextAction.href}
      />

      <Card className="space-y-3">
        <p className="text-small font-semibold uppercase tracking-wide text-primary">
          Recommended next
        </p>
        <h2 className="font-heading text-h4 font-bold text-heading">{nextAction.title}</h2>
        <p className="text-neutral-600">{nextAction.description}</p>
        <Link
          to={nextAction.href}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-semibold text-on-primary hover:bg-primary-hover"
        >
          {nextAction.ctaLabel}
        </Link>
      </Card>

      {completedLessons === 0 ? (
        <EmptyState
          icon="🌱"
          title="Welcome to your progress dashboard"
          message="Ready to start? Begin with Budgeting Basics"
          action={
            <Link
              to={nextAction.href}
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
