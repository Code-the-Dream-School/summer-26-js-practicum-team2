import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { ROUTES } from '../app/router/routes.js'
import useAuth from '../hooks/useAuth.js'
import cashFlow from '../../../shared/content/budgeting.json'
import LearningPathNode from '../components/learningPath/LearningPathNode'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'

// We do not know the progress API endpoint yet.
// Add it here when the backend route is ready.
const PROGRESS_API_URL = null

function getMicroLessonPreview(content = []) {
  return content
    .filter(
      (item) =>
        item.type === 'paragraph' || item.type === 'callout' || item.type === 'characterIntro',
    )
    .map((item) => item.text.replace(/\s+/g, ' ').trim())
    .slice(0, 2)
    .join(' ')
}

function LearningPathPage() {
  const navigate = useNavigate()

  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page. This ensures that only authenticated users can access the dashboard.
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Mock Progress
  // This can be used until the backend progress endpoint is ready.
  const mockProgress = {
    currentModule: 'cashFlow',
    currentLessonId: '1.2',
    currentMicroLessonId: '1.2.3',
  }

  // Setting state for user progress
  // For getting progress from backend
  const [progress, setProgress] = useState(mockProgress)

  useEffect(() => {
    // We do not know the API endpoint yet, so use mock progress for now.
    if (!PROGRESS_API_URL) {
      return
    }

    fetch(PROGRESS_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load user progress')
        }

        return response.json()
      })
      .then((data) => {
        setProgress(data)
      })
      .catch((error) => {
        console.error('Error loading progress:', error)

        // Keep using mock progress if the request fails.
        setProgress(mockProgress)
      })
  }, [])

  // Use progress to determine which module to load

  // const currentModule = modules[progress.currentModule]

  // For now, we only have the Cash Flow module.
  const currentModule = cashFlow

  // Build path from current module
  const learningPath = currentModule.lessons.flatMap((lesson) =>
    lesson.microLessons.map((microLesson) => ({
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
  )

  const currentIndex = learningPath.findIndex(
    (node) => node.microLessonId === progress.currentMicroLessonId,
  )

  const currentNode = currentIndex >= 0 ? learningPath[currentIndex] : null

  // For scrolling to the current microLesson node in the learning path
  const currentNodeRef = useRef(null)

  // Refs used for drawing the lines between each learning path node
  const pathContainerRef = useRef(null)
  const nodeRefs = useRef([])

  // State for storing the center coordinates of each node and the size of the SVG container
  const [nodeCenters, setNodeCenters] = useState([])
  const [svgSize, setSvgSize] = useState({
    width: 288,
    height: 29 * 16,
  })

  // Calculate the height of the learning path container based on the number of nodes
  const pathHeight = Math.max(learningPath.length * 5.9 + 2, 29)

  // Constants for the circle radius and the visible gap between nodes
  const circleRadius = 35
  const visibleGap = 10

  // Use useLayoutEffect to calculate the positions of the nodes and the size of the SVG container after the component has rendered. This ensures that we have accurate measurements for drawing the lines between nodes.
  useLayoutEffect(() => {
    function updateLayout() {
      // If the path container ref is not set, we cannot calculate the layout, so we return early.
      if (!pathContainerRef.current) {
        return
      }
      // Get the bounding rectangle of the path container to determine its size and position on the page.
      const containerRect = pathContainerRef.current.getBoundingClientRect()

      setSvgSize({
        // Set the width and height of the SVG container based on the size of the path container and the calculated path height. If the containerRect does not provide a width or height, we use default values.
        width: containerRect.width || 288,
        height: containerRect.height || pathHeight * 16,
      })

      // Calculate the center coordinates of each node based on their bounding rectangles and the position of the path container. This allows us to draw lines between the centers of the nodes.
      const nextCenters = nodeRefs.current.map((nodeElement) => {
        if (!nodeElement) {
          return null
        }
        // Get the bounding rectangle of the node element to determine its size and position on the page.
        const nodeRect = nodeElement.getBoundingClientRect()

        // Calculate the center coordinates of the node element relative to the path container.
        return {
          x: nodeRect.left - containerRect.left + nodeRect.width / 2,

          y: nodeRect.top - containerRect.top + nodeRect.height / 2,
        }
      })
      // Update the state with the calculated center coordinates of the nodes which triggers a re-render to draw the lines between the nodes based on their new positions.
      setNodeCenters(nextCenters)
    }

    // Call updateLayout initially to set the positions of the nodes and the size of the SVG container.
    updateLayout()

    // Re-calculate the layout whenever the window is resized
    window.addEventListener('resize', updateLayout)

    return () => {
      // Clean up the event listener when the component is unmounted.
      window.removeEventListener('resize', updateLayout)
    }
  }, [pathHeight])

  // Scroll to the current lesson when the page opens.
  useEffect(() => {
    currentNodeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [])
  // Function to calculate the start and end points of the line connecting two nodes
  function getPathPoints(x1, y1, x2, y2, padding = circleRadius + visibleGap) {
    // Calculate the distance between the two points in the x and y directions
    const xDistance = x2 - x1
    const yDistance = y2 - y1
    // Calculate the length of the line connecting the two points using the Pythagorean theorem
    const length = Math.hypot(xDistance, yDistance) || 1

    return {
      x1: x1 + (xDistance / length) * padding,
      y1: y1 + (yDistance / length) * padding,
      x2: x2 - (xDistance / length) * padding,
      y2: y2 - (yDistance / length) * padding,
    }
  }

  // Function to navigate to the selected lesson when a node is clicked
  function openLesson(node) {
    if (!node) {
      // If the node is null or undefined, we cannot navigate to a lesson, so we return early.
      return
    }
    // Navigate to the lesson page using the moduleId and lessonId from the selected node
    navigate(`/learn/${node.moduleId}/${node.lessonId}`)
  }

  if (!progress) {
    return <Skeleton />
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
          Tap a step to jump straight into the lesson.
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
              const nextNode = learningPath[index + 1]

              const startPoint = nodeCenters[index]
              const endPoint = nodeCenters[index + 1]

              if (!startPoint || !endPoint) {
                return null
              }

              const points = getPathPoints(startPoint.x, startPoint.y, endPoint.x, endPoint.y)

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
              )
            })}
          </svg>

          {/* Rendering the learning path */}
          {learningPath.map((node, index) => {
            let status = 'locked'

            if (index < currentIndex) {
              status = 'completed'
            }

            if (index === currentIndex) {
              status = 'current'
            }

            // Move nodes left and right to create the path shape.
            let left = 'clamp(28%, 30%, 32%)'

            if (index === 0) {
              left = '50%'
            } else if (index % 2 === 1) {
              left = 'clamp(68%, 70%, 72%)'
            }

            const top = `${index * 5.9}rem`

            let tooltipText = 'Locked step. Finish the earlier lesson first.'

            if (status === 'current') {
              tooltipText = 'Current step. Continue from here.'
            }

            if (status === 'completed') {
              tooltipText = 'Completed step. Reopen to review.'
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
                  transform: 'translateX(-50%)',
                }}
                showCallout={index === 0 && status === 'current'}
                tooltipText={`${node.microLessonTitle} - ${tooltipText}`}
                onSelect={openLesson}
                ref={(element) => {
                  nodeRefs.current[index] = element

                  if (index === currentIndex) {
                    currentNodeRef.current = element
                  }
                }}
              />
            )
          })}
        </div>
      </main>

      <footer className="sticky bottom-0 mt-6 border-t border-learning-path-footer-border bg-learning-path-footer-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[22rem] justify-end sm:max-w-[24rem] md:max-w-4xl lg:max-w-6xl">
          <Button
            type="button"
            variant="primary"
            className="rounded-lg border-0 bg-learning-path-button px-8 py-3 text-lg font-semibold text-on-primary shadow-[var(--shadow-learning-path-button)] hover:bg-learning-path-button-hover"
            title={
              currentNode
                ? `Continue to ${currentNode.microLessonTitle}`
                : 'Continue to the current lesson'
            }
            aria-label={
              currentNode
                ? `Continue to ${currentNode.microLessonTitle}`
                : 'Continue to the current lesson'
            }
            onClick={() => openLesson(currentNode)}
          >
            Next
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default LearningPathPage
