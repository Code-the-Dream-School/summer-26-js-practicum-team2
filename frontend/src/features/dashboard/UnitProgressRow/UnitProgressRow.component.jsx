import Card from "../../../shared/Card/Card.component";
import ProgressBar from "../../../shared/ProgressBar/ProgressBar.component";

export default function UnitProgressRow({ unit }) {
  return (
    <Card className="px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-heading">{unit.name}</p>
          <p className="text-small text-neutral-600">
            {unit.completedLessons}/{unit.totalLessons} lessons complete
          </p>
        </div>

        <ProgressBar
          variant="circular"
          size="sm"
          value={unit.progressPercent}
          label={`${unit.name} progress`}
          className="shrink-0 self-end min-[380px]:self-auto"
        />
      </div>
    </Card>
  );
}
