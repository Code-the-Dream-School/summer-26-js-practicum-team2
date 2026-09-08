import Button from "../../../shared/Button/Button.component";

const statusVariant = {
  current: "circleCurrent",
  completed: "circleCompleted",
  locked: "circleDisabled",
};

function LearningPathNode({ node, status, stepNumber, style, tooltipText, onSelect, ref }) {
  const variant = statusVariant[status] ?? statusVariant.locked;
  return (
    <div ref={ref} style={style} className="absolute flex flex-col items-center">
      <Button
        variant={variant}
        disabled={status === "locked"}
        title={tooltipText || `${node.microLessonId}: ${node.microLessonTitle}`}
        aria-label={`${node.microLessonId}: ${node.microLessonTitle}`}
        onClick={() => onSelect?.(node)}
      >
        <span className="text-[1.25rem] font-bold leading-none">{stepNumber}</span>
      </Button>
    </div>
  );
}

export default LearningPathNode;
