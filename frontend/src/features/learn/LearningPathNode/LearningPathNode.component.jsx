import Button from "../../../shared/Button/Button.component";

const statusVariant = {
  current: "circleCurrent",
  completed: "circleCompleted",
  locked: "circleDisabled",
};

const statusBadge = {
  current: { icon: "▶", label: "Current step" },
  completed: { icon: "✓", label: "Completed step" },
  locked: { icon: "🔒", label: "Locked step" },
};

function LearningPathNode({ node, status, stepNumber, style, tooltipText, onSelect, ref }) {
  const variant = statusVariant[status] ?? statusVariant.locked;
  const badge = statusBadge[status] ?? statusBadge.locked;

  return (
    <div ref={ref} style={style} className="absolute flex flex-col items-center">
      <div className="relative">
        <Button
          variant={variant}
          disabled={status === "locked"}
          title={tooltipText || `${node.microLessonId}: ${node.microLessonTitle}`}
          aria-label={`${node.microLessonId}: ${node.microLessonTitle}`}
          onClick={() => onSelect?.(node)}
        >
          <span className="text-[1.25rem] font-bold leading-none">{stepNumber}</span>
        </Button>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-circle-border bg-learning-path-surface text-[0.7rem] leading-none text-learning-path-heading shadow-sm"
        >
          {badge.icon}
        </span>
      </div>
    </div>
  );
}

export default LearningPathNode;
