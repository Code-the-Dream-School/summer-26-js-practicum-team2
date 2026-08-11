import { forwardRef } from 'react'
import Button from '../ui/Button'

const statusVariant = {
  current: 'circleCurrent',
  completed: 'circleCompleted',
  locked: 'circleDisabled',
}

const LearningPathNode = forwardRef(
  // The LearningPathNode component represents a single node in the learning path. It displays a button with a step number and can show a callout message if specified.
  ({ node, status, stepNumber, style, showCallout = false, tooltipText, onSelect }, ref) => {
    // Determine the button variant based on the node's status. If the status is not recognized, default to 'locked'.
    const variant = statusVariant[status] ?? statusVariant.locked

    return (
      <div ref={ref} style={style} className="absolute flex flex-col items-center">
        {/* Callout message for the current node, displayed if showCallout is true */}
        {/* Will prove useful during onboarding phase */}
        {showCallout ? (
          <div className="absolute left-[-8.9rem] top-[4.35rem] w-[7.8rem] rounded-sm bg-[#dff0dc] px-2 py-1 text-[0.68rem] leading-4 text-[#263e39] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
            This is where you will begin but move on as you complete the lesson!
            <span className="absolute -right-2 top-[-0.05rem] h-px w-6 rotate-[34deg] bg-[#263e39]" />
          </div>
        ) : null}
        {/*  Display a button that represents the node in the learning path */}
        <Button
          variant={variant}
          title={tooltipText || `${node.microLessonId}: ${node.microLessonTitle}`}
          aria-label={`${node.microLessonId}: ${node.microLessonTitle}`}
          onClick={() => onSelect?.(node)}
        >
          <span className="text-[1.25rem] font-bold leading-none">{stepNumber}</span>
        </Button>
      </div>
    )
  },
)

export default LearningPathNode
