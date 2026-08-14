import { forwardRef } from "react";
import Button from "../../shared/Button/Button.component";

const statusVariant = {
  current: "circleCurrent",
  completed: "circleCompleted",
  locked: "circleDisabled",
};

const LearningPathNode = forwardRef(
  // The LearningPathNode component represents a single node in the learning path. It displays a button with a step number and can show a callout message if specified.
  ({ node, status, stepNumber, style, showCallout = false, tooltipText, onSelect }, ref) => {
    // Determine the button variant based on the node's status. If the status is not recognized, default to 'locked'.
    const variant = statusVariant[status] ?? statusVariant.locked;

    return (
      <div ref={ref} style={style} className="absolute flex flex-col items-center">
        {/* Callout message for the current node, shown only during onboarding for the very first step */}
        {showCallout ? (
          <div
            role="status"
            className="animate-callout-pop absolute left-[-9.5rem] top-1/2 w-[8.2rem] -translate-y-1/2 rounded-xl border border-learning-path-callout-border bg-learning-path-callout-surface px-3 py-2 text-[0.7rem] font-medium leading-4 text-learning-path-callout-text shadow-[var(--shadow-learning-path-callout)]"
          >
            <span aria-hidden="true" className="mr-1">
              👋
            </span>
            Start here, then move on as you complete each lesson!
            <span className="absolute right-[-0.35rem] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-learning-path-callout-border bg-learning-path-callout-surface" />
          </div>
        ) : null}

        {/*  Display a button that represents the node in the learning path */}
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
  },
);

LearningPathNode.displayName = "LearningPathNode";

export default LearningPathNode;
