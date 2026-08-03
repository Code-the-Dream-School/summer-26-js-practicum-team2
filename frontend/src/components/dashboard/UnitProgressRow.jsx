import Card from '../ui/Card.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'

export default function UnitProgressRow({ unit }) {
  return (
    <Card className="px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {unit.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-heading">{unit.name}</p>
            <p className="text-small text-neutral-600">
              {unit.completedLessons}/{unit.totalLessons} lessons complete
            </p>
          </div>
        </div>

        <ProgressBar
          variant="circular"
          size="sm"
          value={unit.progressPercent}
          label={`${unit.name} progress`}
          className="shrink-0"
        />
      </div>
    </Card>
  )
}
