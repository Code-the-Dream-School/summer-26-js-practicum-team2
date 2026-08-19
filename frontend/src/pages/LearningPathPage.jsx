import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { DEFAULT_LESSON_ID, DEFAULT_MODULE_ID } from "../hooks/useLessonContent";
import { getLesson, getLessonProgress } from "../services/api";
import LearningPathNode from "../features/learn/LearningPathNode/LearningPathNode.component";
import Button from "../shared/Button/Button.component";
import Skeleton from "../shared/Skeleton/Skeleton.component";

function getMicroLessonPreview(content = []) {
  return content
    .filter(
      (item) =>
        item.type === "paragraph" || item.type === "callout" || item.type === "characterIntro",
    )
    .map((item) => item.text.replace(/\s+/g, " ").trim())
    .slice(0, 2)
    .join(" ");
}

function LearningPathPage() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthContext();

  const [progress, setProgress] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let isActive = true;

    async function loadLearningPath() {
      try {
        // The saved progress tells us which module and lesson to load the content for.
        const progressPayload = await getLessonProgress(DEFAULT_MODULE_ID);
        const lessonPayload = await getLesson(
          progressPayload.currentModule || DEFAULT_MODULE_ID,
          progressPayload.currentLessonId || DEFAULT_LESSON_ID,
        );

        if (!isActive) {
          return;
        }

        setProgress(progressPayload);
        setCurrentModule(lessonPayload.moduleData);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(requestError.message || "We could not load your learning path right now.");
      }
    }

    loadLearningPath();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  // Build path from the module content returned by the API
  const learningPath = (currentModule?.lessons ?? []).flatMap((lesson) =>
    (lesson.microLessons ?? []).map((microLesson) => ({
      moduleId: currentModule.id,

      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonGoal: lesson.learningGoal,
      lessonEstimatedMin: lesson.estimatedMin,

      microLessonId: microLesson.id,
      microLessonTitle: microLesson.title,
      microLessonPreview: getMicroLessonPreview(microLesson.microLessonContent),
      microLessonContentCount: microLesson.microLessonContent?.length ?? 0,
    })),
  );

  const completedMicroLessons = new Set(progress?.completedMicroLessons ?? []);

  const savedIndex = learningPath.findIndex(
    (node) => node.microLessonId === progress?.currentMicroLessonId,
  );

  // Micro-lessons without a quiz are never marked complete, so unlock the step right after the furthest completed one.
  const lastCompletedIndex = learningPath.reduce(
    (furthestIndex, node, index) =>
      completedMicroLessons.has(node.microLessonId) ? index : furthestIndex,
    -1,
  );

  // The last step being complete means there is nothing left to unlock in this module.
  const isModuleComplete =
    learningPath.length > 0 &&
    (Boolean(progress?.isModuleCompleted) || lastCompletedIndex === learningPath.length - 1);

  const currentIndex = isModuleComplete
    ? -1
    : Math.min(Math.max(savedIndex, lastCompletedIndex + 1), learningPath.length - 1);

  const currentNode = currentIndex >= 0 ? learningPath[currentIndex] : null;

  // For scrolling to the current microLesson node in the learning path
  const currentNodeRef = useRef(null);

  // Refs used for drawing the lines between each learning path node
  const pathContainerRef = useRef(null);
  const nodeRefs = useRef([]);

  // State for storing the center coordinates of each node and the size of the SVG container
  const [nodeCenters, setNodeCenters] = useState([]);
  const [svgSize, setSvgSize] = useState({
    width: 288,
    height: 29 * 16,
  });

  // Calculate the height of the learning path container based on the number of nodes
  const pathHeight = Math.max(learningPath.length * 5.9 + 2, 29);

  // Constants for the circle radius and the visible gap between nodes
  const circleRadius = 35;
  const visibleGap = 10;

  // Use useLayoutEffect to calculate the positions of the nodes and the size of the SVG container after the component has rendered. This ensures that we have accurate measurements for drawing the lines between nodes.
  useLayoutEffect(() => {
    function updateLayout() {
      // If the path container ref is not set, we cannot calculate the layout, so we return early.
      if (!pathContainerRef.current) {
        return;
      }
      // Get the bounding rectangle of the path container to determine its size and position on the page.
      const containerRect = pathContainerRef.current.getBoundingClientRect();

      setSvgSize({
        // Set the width and height of the SVG container based on the size of the path container and the calculated path height. If the containerRect does not provide a width or height, we use default values.
        width: containerRect.width || 288,
        height: containerRect.height || pathHeight * 16,
      });

      // Calculate the center coordinates of each node based on their bounding rectangles and the position of the path container. This allows us to draw lines between the centers of the nodes.
      const nextCenters = nodeRefs.current.map((nodeElement) => {
        if (!nodeElement) {
          return null;
        }
        // Get the bounding rectangle of the node element to determine its size and position on the page.
        const nodeRect = nodeElement.getBoundingClientRect();

        // Calculate the center coordinates of the node element relative to the path container.
        return {
          x: nodeRect.left - containerRect.left + nodeRect.width / 2,

          y: nodeRect.top - containerRect.top + nodeRect.height / 2,
        };
      });
      // Update the state with the calculated center coordinates of the nodes which triggers a re-render to draw the lines between the nodes based on their new positions.
      setNodeCenters(nextCenters);
    }

    // Call updateLayout initially to set the positions of the nodes and the size of the SVG container.
    updateLayout();

    // Re-calculate the layout whenever the window is resized
    window.addEventListener("resize", updateLayout);

    return () => {
      // Clean up the event listener when the component is unmounted.
      window.removeEventListener("resize", updateLayout);
    };
  }, [pathHeight]);

  // Scroll to the current lesson when the page opens.
  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);
  // Function to calculate the start and end points of the line connecting two nodes
  function getPathPoints(x1, y1, x2, y2, padding = circleRadius + visibleGap) {
    // Calculate the distance between the two points in the x and y directions
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    // Calculate the length of the line connecting the two points using the Pythagorean theorem
    const length = Math.hypot(xDistance, yDistance) || 1;

    return {
      x1: x1 + (xDistance / length) * padding,
      y1: y1 + (yDistance / length) * padding,
      x2: x2 - (xDistance / length) * padding,
      y2: y2 - (yDistance / length) * padding,
    };
  }

  // Function to navigate to the selected lesson when a node is clicked
  function openLesson(node) {
    if (!node) {
      // If the node is null or undefined, we cannot navigate to a lesson, so we return early.
      return;
    }
    // Navigate to the lesson page using the moduleId and lessonId from the selected node
    navigate(`/learn/${node.moduleId}/${node.lessonId}`);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm font-medium text-danger">{error}</p>
      </div>
    );
  }

  if (!progress || !currentModule) {
    return <Skeleton />;
  }

  return (
    <div className="min-h-screen bg-learning-path-surface text-learning-path-text">
      <main className="mx-auto flex min-h-screen max-w-[22rem] flex-col px-4 pb-28 pt-5 sm:max-w-[24rem] sm:px-6 md:max-w-4xl lg:max-w-6xl lg:px-8">
        <div className="text-center">
          <h1 className="text-[2.25rem] font-semibold leading-[1.04] tracking-tight text-learning-path-heading sm:text-[2.7rem]">
            Learning:
          </h1>

          <h2 className="mt-1 text-[2rem] font-semibold leading-[1.05] tracking-tight text-learning-path-heading sm:text-[2.35rem]">
            Personal Finance
          </h2>
        </div>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-learning-path-divider" />

          <h3 className="whitespace-nowrap text-2xl font-semibold text-learning-path-heading">
            {currentModule.title}
          </h3>

          <div className="h-px flex-1 bg-learning-path-divider" />
        </div>

        <p className="mt-3 text-center text-sm leading-6 text-learning-path-muted">
          {isModuleComplete
            ? "You are all caught up. Revisit any step to review it."
            : "Tap a step to jump straight into the lesson."}
        </p>

        <div
          ref={pathContainerRef}
          className="relative mx-auto mt-5 w-full max-w-[18rem] md:max-w-[34rem] lg:max-w-[44rem]"
          style={{ height: `${pathHeight}rem` }}
        >
          {/* Lines connecting the learning path nodes */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            fill="none"
          >
            <defs>
              <marker
                id="learning-path-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-learning-path-line)" />
              </marker>
            </defs>

            {learningPath.slice(0, -1).map((node, index) => {
              const nextNode = learningPath[index + 1];

              const startPoint = nodeCenters[index];
              const endPoint = nodeCenters[index + 1];

              if (!startPoint || !endPoint) {
                return null;
              }

              const points = getPathPoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

              return (
                <line
                  key={`${node.microLessonId}-${nextNode.microLessonId}`}
                  x1={points.x1}
                  y1={points.y1}
                  x2={points.x2}
                  y2={points.y2}
                  stroke="var(--color-learning-path-line)"
                  strokeWidth="1.5"
                  markerEnd="url(#learning-path-arrow)"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Rendering the learning path */}
          {learningPath.map((node, index) => {
            let status = "locked";

            if (
              isModuleComplete ||
              completedMicroLessons.has(node.microLessonId) ||
              index < currentIndex
            ) {
              status = "completed";
            }

            if (index === currentIndex) {
              status = "current";
            }

            // Move nodes left and right to create the path shape.
            let left = "clamp(28%, 30%, 32%)";

            if (index === 0) {
              left = "50%";
            } else if (index % 2 === 1) {
              left = "clamp(68%, 70%, 72%)";
            }

            const top = `${index * 5.9}rem`;

            let tooltipText = "Locked step. Finish the earlier lesson first.";

            if (status === "current") {
              tooltipText = "Current step. Continue from here.";
            }

            if (status === "completed") {
              tooltipText = "Completed step. Reopen to review.";
            }

            return (
              <LearningPathNode
                key={node.microLessonId}
                node={node}
                status={status}
                stepNumber={index + 1}
                style={{
                  left,
                  top,
                  transform: "translateX(-50%)",
                }}
                showCallout={index === 0 && status === "current"}
                tooltipText={`${node.microLessonTitle} - ${tooltipText}`}
                onSelect={openLesson}
                ref={(element) => {
                  nodeRefs.current[index] = element;

                  if (index === currentIndex) {
                    currentNodeRef.current = element;
                  }
                }}
              />
            );
          })}
        </div>
      </main>

      <footer className="sticky bottom-0 mt-6 border-t border-learning-path-footer-border bg-learning-path-footer-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[22rem] justify-end sm:max-w-[24rem] md:max-w-4xl lg:max-w-6xl">
          {isModuleComplete ? (
            <p className="text-lg font-semibold text-learning-path-heading">
              Module complete. You are all caught up!
            </p>
          ) : (
            <Button
              type="button"
              variant="primary"
              className="rounded-lg border-0 bg-learning-path-button px-8 py-3 text-lg font-semibold text-on-primary shadow-[var(--shadow-learning-path-button)] hover:bg-learning-path-button-hover"
              title={
                currentNode
                  ? `Continue to ${currentNode.microLessonTitle}`
                  : "Continue to the current lesson"
              }
              aria-label={
                currentNode
                  ? `Continue to ${currentNode.microLessonTitle}`
                  : "Continue to the current lesson"
              }
              onClick={() => openLesson(currentNode)}
            >
              Resume
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default LearningPathPage;
