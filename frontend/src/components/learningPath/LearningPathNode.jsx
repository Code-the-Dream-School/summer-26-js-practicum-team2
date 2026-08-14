// import Card from '../ui/Card'
import { useNavigate } from "react-router";
import { forwardRef } from "react";
import Button from "../ui/Button";

const LearningPathNode = forwardRef(({ node, status }, ref) => {
  let variant;
  const navigate = useNavigate();

  if (status === "current") {
    variant = "circleCurrent";
  }

  if (status === "completed") {
    variant = "circleCompleted";
  }

  if (status === "locked") {
    variant = "circleDisabled";
  }

  return (
    <div
      ref={ref}
      className={`flex w-full flex-col items-center gap-2 ${status === "current" ? "scroll-mt-32" : ""}`}
    >
      <h3 className="mt-2 items-center text-center text-lg font-semibold text-heading">
        {node.microLessonTitle}
      </h3>
      <Button
        variant={variant}
        disabled={status === "locked"}
        onClick={() => {
          if (status !== "locked") {
            navigate(`/lesson/${node.moduleId}/${node.lessonId}/${node.microLessonId}`);
          }
        }}
      >
        {/* <div>
        {status === 'completed' && '✅'}
        {status === 'current' && '🟢'}
        {status === 'locked' && '🔒'}
      </div> */}

        <p className="text-lg font-bold">{node.microLessonId}</p>

        {/* <h3>
        {node.microLessonId}: {node.microLessonTitle}
      </h3> */}
      </Button>
      <div className="h-12 w-1 bg-neutral-300" />
    </div>
  );
});

export default LearningPathNode;
