import DashboardHero from '../components/dashboard/DashboardHero.jsx'

function Dashboard() {
  // Randomizes the name, status, and streak for the dashboard hero
  const names = ['Berenice', 'Danylo', 'Kristen', 'Maryzabeth', 'Mikey']
  const name = names[Math.floor(Math.random() * names.length)]
  const statuses = ['new', 'in-progress', 'complete']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const streak = Math.floor(Math.random() * 100)
  return (
    <div className="space-y-8">
      <DashboardHero name={name} status={status} streak={streak} />
    </div>
  )
}

export default Dashboard
