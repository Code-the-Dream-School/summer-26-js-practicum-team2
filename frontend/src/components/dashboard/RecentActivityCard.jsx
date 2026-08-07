import Card from '../ui/Card.jsx'

export default function RecentActivityCard({ activity = [] }) {
  return (
    <Card>
      <h2 className="font-heading text-h4 font-bold text-heading">Recent activity</h2>

      {activity.length === 0 ? (
        <p className="mt-3 text-small text-neutral-600">
          Complete a lesson to start your activity feed.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {activity.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-surface-inset px-3 py-2"
            >
              <span className="text-small text-heading">{item.label}</span>
              <span className="text-small text-neutral-600">{item.timeLabel}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
