// Static content for testing and showing the dashboard hero card
const content = {
  new: {
    greeting: 'Welcome',
    message: 'Start your first lesson today.',
    goal: 'Complete your first lesson',
    progress: 0,
    button: 'Start lesson',
  },
  'in-progress': {
    greeting: 'Welcome back',
    message: 'Keep going! You are making progress.',
    goal: 'Finish your current lesson',
    progress: 60,
    button: 'Continue',
  },
  complete: {
    greeting: 'Great job',
    message: 'You are all caught up for today.',
    goal: "Today's goal is complete",
    progress: 100,
    button: 'Review lessons',
  },
}

export default function DashboardHero({ name = 'Learner', status = 'new', streak = 0 }) {
  // Maps the status to content and defines it as `current`
  const current = content[status]

  return (
    <section className="rounded-lg border border-neutral-200 bg-surface-raised p-6 text-foreground shadow-sm">
      <p className="text-small font-medium text-primary">{streak} day streak</p>

      <h1 className="mt-2 font-heading text-h2 font-bold text-heading">
        {current.greeting}, {name}!
      </h1>

      <p className="mt-2 text-neutral-600">{current.message}</p>

      <div className="mt-6 rounded-lg bg-surface-inset p-4">
        <p className="text-small font-semibold text-neutral-600">Today's goal</p>
        <p className="mt-1 font-semibold">{current.goal}</p>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200"
          role="progressbar"
          aria-valuenow={current.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-primary" style={{ width: `${current.progress}%` }} />
        </div>

        <button
          type="button"
          className="mt-4 rounded-md bg-primary px-4 py-2 font-semibold text-on-primary hover:bg-primary-hover focus:outline-2 focus:outline-offset-2 focus:outline-focus"
        >
          {current.button}
        </button>
      </div>
    </section>
  )
}
