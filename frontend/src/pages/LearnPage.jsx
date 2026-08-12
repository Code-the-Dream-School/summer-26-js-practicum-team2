import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams, Navigate } from 'react-router'
import useAuth from '../hooks/useAuth.js'
import useLessonContent from '../hooks/useLessonContent.js'
import { ROUTES } from '../app/router/routes.js'
import { modules } from '../../../shared/content/index.js'
import { startQuiz, submitQuiz, updateLessonProgress } from '../services/api.js'
import LessonComponent from '../components/learn/LessonComponent.jsx'
import QuizComponent from '../components/learn/QuizComponent.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import dabbingBeaverImg from '../assets/dabbingBeaver.svg'
import abigailImg from '../assets/abigail.svg'
import ramonaImg from '../assets/ramona.svg'
import rightAnswerIcon from '../assets/right_answer.svg'
import wrongAnswerIcon from '../assets/wrong_answer.svg'
import { scoreQuizAttempt } from '../utils/quizScoring.js'

// The quiz API rejects a new attempt within five seconds of the previous one.
const QUIZ_RETRY_COOLDOWN_MS = 5000

// Helper function to normalize content items by ensuring each item has a unique ID.
function normalizeContent(content = []) {
  return content.map((item, index) => ({
    id: item.id ?? `${item.type}-${index}`,
    ...item,
  }))
}

// Helper function to normalize a quiz question by ensuring it has a unique ID, the correct choice IDs are in an array format, and the choices are properly structured.
function normalizeQuestion(question, index) {
  // Ensure the correct response is in an array format for consistency.
  const correctResponse = question.correctResponse
  // If correctResponse is not an array, wrap it in an array. If it's undefined, use an empty array.
  const correctChoiceIds = Array.isArray(correctResponse) ? correctResponse : [correctResponse]
  // Determine the answer choices for the question. If answerChoices are provided, use them; otherwise, fall back to the choices property.
  const answerChoices = question.answerChoices ?? question.choices ?? []
  // Return a normalized question object with a unique ID, type, prompt, choices, correct choice IDs, and an explanation.
  return {
    id: question.id ?? `question-${index + 1}`,
    characterId: question.characterId ?? null,
    type: question.questionType === 'multiSelect' ? 'multiSelect' : 'singleChoice',
    prompt: question.question ?? question.prompt,
    choices: answerChoices.map((choice) => ({
      id: choice.key ?? choice.id,
      label: choice.text ?? choice.label,
    })),
    correctChoiceIds: correctChoiceIds.filter(Boolean),
    explanation: question.explanation ?? 'Review the lesson and try this one again.',
  }
}

// Normalize the learning data by extracting lesson steps and questions from the provided module and lesson data.
function normalizeLearnData({ moduleData, lessonData }) {
  if (!lessonData) {
    return null
  }
  // Extract the micro-lessons from the lesson data, defaulting to an empty array if not present.
  const microLessons = lessonData.microLessons ?? []
  // Map over the micro-lessons to create lesson steps, extracting relevant information such as the title, character ID, and content.
  const lessonSteps = microLessons.map((microLesson) => {
    const content = microLesson.microLessonContent ?? []
    // Allow any content item to set the character, not only characterIntro items.
    const firstCharacterContent = content.find((item) => item.characterId)
    // Return a normalized lesson step object with the micro-lesson ID, title, character ID, and filtered content (excluding knowledge check items).
    return {
      id: microLesson.id,
      title: microLesson.title,
      characterId: firstCharacterContent?.characterId,
      content: normalizeContent(content.filter((item) => item.type !== 'knowledgeCheck')),
    }
  })
  // Flatten the questions from all micro-lessons, normalizing each question and associating it with its corresponding lesson step ID.
  const questions = microLessons.flatMap((microLesson) => {
    // Extract the content from the micro-lesson, defaulting to an empty array if not present.
    const content = microLesson.microLessonContent ?? []
    // Filter the content to include only knowledge check items and normalize each question, associating it with the micro-lesson ID.
    return content
      .filter((item) => item.type === 'knowledgeCheck')
      .map((question, index) => ({
        ...normalizeQuestion(question, index),
        lessonStepId: microLesson.id,
      }))
  })
  // Return the normalized learning data, including the module ID, module title, lesson ID, lesson title, learning goal, pass threshold, lesson steps, and questions.
  const moduleLessons = moduleData?.lessons ?? []
  // Find the position of the current lesson within the module's lessons to determine the next lesson ID.
  const lessonPosition = moduleLessons.findIndex((lesson) => lesson.id === lessonData.id)

  return {
    id: lessonData.id,
    moduleId: moduleData?.id,
    module: moduleData,
    moduleTitle: moduleData?.title,
    title: lessonData.title,
    learningGoal: lessonData.learningGoal,
    passThreshold: (lessonData.passingScore ?? 70) / 100,
    nextLessonId: lessonPosition >= 0 ? (moduleLessons[lessonPosition + 1]?.id ?? null) : null,
    lessonSteps,
    questions,
  }
}
// The sample preview is served to signed-out visitors, who cannot call the authenticated lesson API, so it reads from the bundled content instead.
function getSampleLesson({ moduleId, lessonId }) {
  const moduleData = modules[moduleId] ?? modules.cashFlow
  const lessonData =
    moduleData?.lessons?.find((lesson) => lesson.id === lessonId) ?? moduleData?.lessons?.[0]

  return {
    moduleData,
    lessonData,
  }
}
// Determine the starting phase of the learning flow based on the presence of lesson steps and questions.
function getStartingPhase(lessonSteps, questions) {
  if (lessonSteps.length > 0) {
    // If there are lesson steps available, start with the "lesson" phase.
    return 'lesson'
  }

  if (questions.length > 0) {
    // If there are no lesson steps but questions are available, start with the "quiz" phase.
    return 'quiz'
  }
  // If there are neither lesson steps nor questions, start with the "result" phase.
  return 'result'
}

// Selects a random lesson from the available lessons in the module for the sample preview.
function selectRandomLesson(lessonSteps) {
  if (!lessonSteps || lessonSteps.length === 0) {
    return null
  }
  const randomIndex = Math.floor(Math.random() * lessonSteps.length)
  return lessonSteps[randomIndex]
}

// Micro-lesson titles often repeat the lesson title, so compare them loosely to avoid showing both.
function titlesOverlap(lessonTitle = '', stepTitle = '') {
  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalizedLessonTitle = normalize(lessonTitle)
  const normalizedStepTitle = normalize(stepTitle)

  if (!normalizedLessonTitle || !normalizedStepTitle) {
    return false
  }

  return (
    normalizedLessonTitle.includes(normalizedStepTitle) ||
    normalizedStepTitle.includes(normalizedLessonTitle)
  )
}

// Find the lesson step the user last worked on so they resume where they left off.
function getResumeIndex(lessonSteps, savedProgress) {
  const savedMicroLessonId = savedProgress?.currentMicroLessonId

  if (!savedMicroLessonId) {
    return 0
  }

  const resumeIndex = lessonSteps.findIndex((lesson) => lesson.id === savedMicroLessonId)

  return resumeIndex >= 0 ? resumeIndex : 0
}

// The LearnFlow component manages the learning flow, including lesson steps, quiz questions, and the result phase.
function LearnFlow({
  learnData,
  characterImages,
  guideImage,
  savedProgress = null,
  csrfToken,
  isReadOnly = false,
}) {
  // Destructure the lesson steps and questions from the learnData object for easier access.
  const lessonSteps = learnData.lessonSteps
  // Destructure the questions from the learnData object for easier access.
  const questions = learnData.questions
  // Initialize the phase state based on the starting phase determined by the presence of lesson steps and questions.
  const [phase, setPhase] = useState(() => getStartingPhase(lessonSteps, questions))
  // Initialize state variables for the current lesson index, question index, selected choice IDs, answers, and review answer.
  const [lessonIndex, setLessonIndex] = useState(() => getResumeIndex(lessonSteps, savedProgress))
  const [lessonContentIndex, setLessonContentIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedChoiceIds, setSelectedChoiceIds] = useState([])
  const [answers, setAnswers] = useState([])
  const [reviewAnswer, setReviewAnswer] = useState(null)
  // Server-side quiz state: the open attempt id and the graded result per micro-lesson.
  const [attemptIds, setAttemptIds] = useState({})
  const [submissions, setSubmissions] = useState({})
  const [quizError, setQuizError] = useState('')
  const [retryUnlockAt, setRetryUnlockAt] = useState(0)
  const [isRetryLocked, setIsRetryLocked] = useState(false)
  const [isQuizOnly, setIsQuizOnly] = useState(false)
  // Get the current lesson and question based on the current indices.
  const currentLesson = lessonSteps[lessonIndex]
  const currentLessonContent = currentLesson?.content ?? []
  const lessonContentCount = currentLessonContent.length
  const currentContentItem = currentLessonContent[lessonContentIndex]
  const currentQuestion = questions[questionIndex]
  // Determine if there are any quiz questions available.
  const hasQuiz = questions.length > 0
  // Prefer a question-level character override during quiz mode, then the current content chunk, then the lesson default.
  const currentCharacterId =
    phase === 'quiz'
      ? (currentQuestion?.characterId ??
        currentContentItem?.characterId ??
        currentLesson?.characterId)
      : (currentContentItem?.characterId ?? currentLesson?.characterId)
  // Set the current character image and alt text based on the character ID. If no character ID is available, use the default guide image and alt text.
  let currentCharacterVariant = 'beaver'
  let currentCharacterImage = characterImages.beaver ?? guideImage
  let currentCharacterAlt = 'Sprout lesson guide'

  if (currentCharacterId) {
    // If a character ID is available, use it as the character variant and resolve a matching image.
    currentCharacterVariant = currentCharacterId
    currentCharacterImage =
      characterImages[currentCharacterId] ?? characterImages.beaver ?? guideImage
    // Set the alt text for the character image based on the character ID, capitalizing the first letter of the ID.
    currentCharacterAlt = currentCharacterId.charAt(0).toUpperCase() + currentCharacterId.slice(1)
  }
  // Filter the questions to get only those associated with the current lesson step.
  const currentLessonQuestions = questions.filter(
    (question) => question.lessonStepId === currentLesson?.id,
  )
  // Find the position of the current question within the current lesson's questions.
  const questionPosition = currentLessonQuestions.findIndex(
    (question) => question.id === currentQuestion?.id,
  )
  // Calculate the total number of lesson content steps by summing the maximum of each lesson's content length or 1 (to account for lessons with no content).
  const totalLessonContentSteps = lessonSteps.reduce(
    (total, lesson) => total + Math.max(lesson.content?.length ?? 0, 1),
    0,
  )

  // Calculate the total number of steps in the learning flow, including lesson chunks and quiz questions.
  const totalSteps = totalLessonContentSteps + questions.length
  // Calculate the number of completed steps before the current lesson, including both lesson steps and quiz questions.
  let completedStepsBeforeLesson = 0
  // Iterate through the lesson steps before the current lesson and count the number of completed steps, including both lesson steps and quiz questions.
  lessonSteps.slice(0, lessonIndex).forEach((lesson) => {
    const lessonContentSteps = Math.max(lesson.content?.length ?? 0, 1)
    const lessonQuestionCount = questions.filter(
      (question) => question.lessonStepId === lesson.id,
    ).length
    // Add the lesson chunks and the number of quiz questions associated with that lesson to the completed steps count.
    completedStepsBeforeLesson += lessonContentSteps + lessonQuestionCount
  })
  // Calculate the current step in the learning flow based on the phase, completed steps before the lesson, and the position of the current question.
  const currentLessonContentSteps = Math.max(lessonContentCount, 1)
  let currentStep =
    completedStepsBeforeLesson + Math.min(lessonContentIndex, currentLessonContentSteps - 1)

  if (phase === 'quiz') {
    // If the current phase is "quiz," include all lesson chunks in this step, then add the current question position.
    currentStep =
      completedStepsBeforeLesson +
      currentLessonContentSteps +
      Math.max(questionPosition, 0) +
      (reviewAnswer ? 1 : 0)
  }

  if (phase === 'result') {
    // If the current phase is "result," set the current step to the total number of steps, indicating that the learning flow is complete.
    currentStep = totalSteps
  }
  // Calculate the progress percentage based on the current step and total steps, ensuring that the percentage is rounded to the nearest whole number. If there are no total steps, set the progress percentage to 0.
  const progressPercent = totalSteps === 0 ? 0 : Math.round((currentStep / totalSteps) * 100)
  // Use the useMemo hook to calculate the quiz result based on the current answers and pass threshold, ensuring that the calculation is only performed when the answers or pass threshold change.
  const result = useMemo(() => {
    return scoreQuizAttempt({
      questions,
      answers,
      passThreshold: learnData.passThreshold,
    })
  }, [answers, learnData.passThreshold, questions])
  // Determine if the current question is the last question in the learning flow by checking if the current lesson index is the last lesson and if the current question position is the last question in the current lesson's questions.
  const currentMicroLessonId = currentLesson?.id
  // Determine if the user can sync progress with the backend based on whether the flow is read-only and if a CSRF token is available. If the flow is read-only or there is no CSRF token, syncing progress will be disabled.
  const canSyncProgress = !isReadOnly && Boolean(csrfToken)

  // Save the user's position whenever they move to another micro-lesson so they can resume later.
  useEffect(() => {
    if (!canSyncProgress || !currentMicroLessonId) {
      return
    }

    updateLessonProgress({
      moduleId: learnData.moduleId,
      lessonId: learnData.id,
      microLessonId: currentMicroLessonId,
      csrfToken,
    }).catch(() => {
      // Losing a position update should not interrupt the lesson.
    })
  }, [canSyncProgress, csrfToken, currentMicroLessonId, learnData.id, learnData.moduleId])

  useEffect(() => {
    if (!retryUnlockAt) {
      return undefined
    }

    const timeoutId = setTimeout(
      () => setIsRetryLocked(false),
      Math.max(retryUnlockAt - Date.now(), 0),
    )

    return () => clearTimeout(timeoutId)
  }, [retryUnlockAt])

  // Open a server-side quiz attempt for the micro-lesson the user is about to be quizzed on.
  async function beginQuizAttempt(microLessonId) {
    if (!canSyncProgress || !microLessonId || attemptIds[microLessonId]) {
      // If syncing progress is disabled, the micro-lesson ID is not provided, or there is already an open attempt for this micro-lesson, do not start a new quiz attempt.
      return
    }

    try {
      // Call the startQuiz API to create a new quiz attempt for the specified micro-lesson, passing the module ID, micro-lesson ID, and CSRF token.
      const attempt = await startQuiz({
        moduleId: learnData.moduleId,
        microLessonId,
        csrfToken,
      })

      setAttemptIds((currentAttemptIds) => ({
        // Update the attempt IDs state with the new attempt ID for the specified micro-lesson, preserving any existing attempt IDs for other micro-lessons.
        ...currentAttemptIds,
        [microLessonId]: attempt.attemptId,
      }))
      // Lock the quiz retry for a short cooldown period to prevent rapid consecutive attempts, and set the unlock time based on the current time plus the defined cooldown duration.
      setIsRetryLocked(true)
      // Set the retry unlock time to the current time plus the defined cooldown duration, allowing the user to retry the quiz after the cooldown period has passed.
      setRetryUnlockAt(Date.now() + QUIZ_RETRY_COOLDOWN_MS)
      // Clear any previous quiz error messages to indicate that the quiz attempt was successfully started.
      setQuizError('')
    } catch (requestError) {
      // If the API request to start the quiz attempt fails, set an error message to inform the user that the quiz could not be started.
      setQuizError(requestError.message || 'We could not start this quick check.')
    }
  }

  // Send every answer for the finished micro-lesson to the backend for grading and progress tracking.
  async function submitQuizAttempt(microLessonId, lessonQuestions, submittedAnswers) {
    if (!canSyncProgress || !microLessonId || lessonQuestions.length === 0) {
      // If syncing progress is disabled, the micro-lesson ID is not provided, or there are no lesson questions to submit, do not proceed with the quiz submission.
      return
    }
    // Prepare the answer payload by mapping each question to its corresponding submitted answer, ensuring that the answer is in an array format (even for single-choice questions).
    const answerPayload = {}
    // Iterate through each question in the lessonQuestions array to find the corresponding submitted answer and populate the answerPayload object with the question ID as the key and the selected choice IDs as the value.
    lessonQuestions.forEach((question) => {
      // Find the submitted answer for the current question.
      const answer = submittedAnswers.find(
        (submittedAnswer) => submittedAnswer.questionId === question.id,
      )
      // If an answer is found, use its choice IDs; otherwise, use an empty array to indicate that no answer was selected for this question. This ensures that the answer payload includes all questions, even if some were unanswered.
      answerPayload[question.id] = answer?.choiceIds ?? []
    })

    try {
      // Call the submitQuiz API to submit the quiz answers for grading and progress tracking, passing the micro-lesson ID, attempt ID, module ID, answer payload, and CSRF token.
      const submission = await submitQuiz(microLessonId, {
        attemptId: attemptIds[microLessonId],
        moduleId: learnData.moduleId,
        answers: answerPayload,
        csrfToken,
      })
      // Update the submissions state with the new submission data for the specified micro-lesson, preserving any existing submissions for other micro-lessons.
      setSubmissions((currentSubmissions) => ({
        ...currentSubmissions,
        [microLessonId]: submission,
      }))
      // Remove the attempt ID for the submitted micro-lesson from the attemptIds state, indicating that the quiz attempt has been completed and is no longer active.
      setAttemptIds((currentAttemptIds) => {
        // Create a copy of the current attempt IDs to avoid mutating the state directly.
        const nextAttemptIds = { ...currentAttemptIds }
        // Delete the attempt ID for the submitted micro-lesson from the nextAttemptIds object to indicate that the quiz attempt has been completed and is no longer active.
        delete nextAttemptIds[microLessonId]
        // Return the updated attempt IDs state without the completed micro-lesson's attempt ID, allowing the user to start a new quiz attempt for that micro-lesson in the future if needed.
        return nextAttemptIds
      })
      // Clear any existing quiz error messages
      setQuizError('')
    } catch (requestError) {
      // If the API request to submit the quiz fails, set an error message
      setQuizError(requestError.message || 'We could not save your quiz results.')
    }
  }

  // Function to reset the learning flow to the starting phase, resetting all relevant state variables to their initial values.
  function clearAttemptState() {
    setLessonContentIndex(0)
    setQuestionIndex(0)
    setSelectedChoiceIds([])
    setAnswers([])
    setReviewAnswer(null)
    setAttemptIds({})
    setSubmissions({})
    setQuizError('')
  }

  // Locate the next micro-lesson that has questions, used to chain quick checks during a quiz-only retry.
  function findNextQuizLessonIndex(fromIndex) {
    return lessonSteps.findIndex(
      (lesson, index) =>
        index > fromIndex && questions.some((question) => question.lessonStepId === lesson.id),
    )
  }

  // Move straight into the quick check for the given lesson step.
  function openQuizForLesson(nextLessonIndex) {
    const nextLesson = lessonSteps[nextLessonIndex]
    // Find the first question associated with the next lesson step to determine where to start the quiz.
    const firstQuestion = questions.find((question) => question.lessonStepId === nextLesson?.id)

    if (!firstQuestion) {
      // If there are no questions associated with the next lesson step, return early to prevent further execution of the function.
      return
    }
    // Set the lesson index to the next lesson step, set the question index to the first question of that lesson, reset the selected choices and review answer, switch to the "quiz" phase, and begin a new quiz attempt for the next lesson step.
    setLessonIndex(nextLessonIndex)
    setQuestionIndex(questions.findIndex((question) => question.id === firstQuestion.id))
    setSelectedChoiceIds([])
    setReviewAnswer(null)
    setPhase('quiz')
    beginQuizAttempt(nextLesson.id)
  }

  // A score of 50% or less replays the lesson content, anything higher retries only the questions.
  function retryLearnFlow() {
    clearAttemptState()

    const firstQuestion = questions[0]

    if (gradedPercentage > 50 && firstQuestion) {
      const firstQuizLessonIndex = lessonSteps.findIndex(
        (lesson) => lesson.id === firstQuestion.lessonStepId,
      )

      setIsQuizOnly(true)
      openQuizForLesson(Math.max(firstQuizLessonIndex, 0))
      return
    }

    setIsQuizOnly(false)
    setLessonIndex(0)
    setPhase(getStartingPhase(lessonSteps, questions))
  }
  // Function to navigate to the next lesson step or quiz question, updating the relevant state variables based on the current phase and position within the learning flow.
  function goToNextLesson() {
    if (lessonContentIndex < lessonContentCount - 1) {
      setLessonContentIndex((currentIndex) => currentIndex + 1)
      return
    }

    if (currentLessonQuestions.length > 0) {
      // If there are quiz questions associated with the current lesson, navigate to the first question of the lesson and reset the selected choices and review answer.
      const firstQuestion = currentLessonQuestions[0]
      // Find the index of the first question within the overall questions array.
      const firstQuestionIndex = questions.findIndex((question) => question.id === firstQuestion.id)
      // Set the question index to the first question of the current lesson, reset the selected choices and review answer, and switch to the "quiz" phase.
      setQuestionIndex(firstQuestionIndex)
      setSelectedChoiceIds([])
      setReviewAnswer(null)
      setPhase('quiz')
      // Start a new quiz attempt for the current micro-lesson to ensure that the user's progress is tracked and graded.
      beginQuizAttempt(currentMicroLessonId)
      // Return early to prevent further execution of the function.
      return
    }

    if (lessonIndex < lessonSteps.length - 1) {
      // If there are more lesson steps available, navigate to the next lesson step and reset the selected choices and review answer.
      setLessonIndex((currentIndex) => currentIndex + 1)
      // Reset the lesson content index to 0 for the new lesson step.
      setLessonContentIndex(0)
      return
    }
    // If there are no more lesson steps and no quiz questions, switch to the "result" phase to indicate that the learning flow is complete.
    setPhase('result')
  }

  function goToPreviousLesson() {
    if (lessonContentIndex > 0) {
      // If there are previous content chunks available in the current lesson, navigate to the previous content chunk by decrementing the lesson content index.
      setLessonContentIndex((currentIndex) => currentIndex - 1)
      return
    }

    if (lessonIndex > 0) {
      // If there are previous lesson steps available, navigate to the previous lesson step and set the lesson content index to the last content chunk of that lesson.
      const previousLesson = lessonSteps[lessonIndex - 1]
      const previousLessonContentCount = previousLesson?.content?.length ?? 0

      setLessonIndex((currentIndex) => currentIndex - 1)
      setLessonContentIndex(Math.max(previousLessonContentCount - 1, 0))
    }
  }

  function checkAnswer() {
    // If there is no current question or no selected choices, return early to prevent further execution of the function.
    if (!currentQuestion || selectedChoiceIds.length === 0) {
      return
    }

    const scoredAnswer = scoreQuizAttempt({
      // Score the current answer by passing the current question, selected choices, and a pass threshold of 1 (indicating that the answer must be fully correct to pass).
      questions: [currentQuestion],
      answers: [
        {
          questionId: currentQuestion.id,
          choiceIds: selectedChoiceIds,
        },
      ],
      passThreshold: 1,
    })

    setAnswers((currentAnswers) => [
      // Update the answers state by filtering out any existing answer for the current question and adding the new answer with the selected choices.
      ...currentAnswers.filter((answer) => answer.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        choiceIds: selectedChoiceIds,
      },
    ])
    setReviewAnswer({
      // Set the review answer state to indicate whether the answer is correct and provide an explanation for the current question.
      isCorrect: scoredAnswer.passed,
      explanation: currentQuestion.explanation,
    })
  }

  async function goToNextQuestion() {
    // If there is no current question, return early to prevent further execution of the function.
    const nextQuestion = currentLessonQuestions[questionPosition + 1]

    if (nextQuestion) {
      // If there is a next question available, navigate to the next question, resetting the selected choices and review answer.
      const nextQuestionIndex = questions.findIndex((question) => question.id === nextQuestion.id)

      setQuestionIndex(nextQuestionIndex)
      setSelectedChoiceIds([])
      setReviewAnswer(null)

      return
    }

    // Every question for this micro-lesson has been answered, so grade and record the attempt.
    await submitQuizAttempt(currentMicroLessonId, currentLessonQuestions, answers)

    const nextQuizLessonIndex = findNextQuizLessonIndex(lessonIndex)

    if (isQuizOnly) {
      // A quiz-only retry runs every quick check back to back, skipping the lesson content.
      if (nextQuizLessonIndex >= 0) {
        openQuizForLesson(nextQuizLessonIndex)
        return
      }

      setPhase('result')
      return
    }

    if (lessonIndex < lessonSteps.length - 1) {
      // If there are more lesson steps available, navigate to the next lesson step, resetting the selected choices and review answer, and switch to the "lesson" phase.
      setLessonIndex((currentIndex) => currentIndex + 1)
      setLessonContentIndex(0)
      setSelectedChoiceIds([])
      setReviewAnswer(null)
      setPhase('lesson')

      return
    }
    // If there are no more lesson steps and no next question, switch to the "result" phase to indicate that the learning flow is complete.
    setPhase('result')
  }
  // Determine if the current question is the last question in the current lesson step.
  const isLastQuestion =
    questionPosition === currentLessonQuestions.length - 1 &&
    (isQuizOnly ? findNextQuizLessonIndex(lessonIndex) < 0 : lessonIndex === lessonSteps.length - 1)

  // Determine if the current content chunk is the last content chunk in the current lesson step.
  const isLastContentChunk = lessonContentIndex === lessonContentCount - 1
  // Determine if the current content chunk is the first content chunk in the current lesson step.
  const isFirstContentChunk = phase === 'lesson' && lessonIndex === 0 && lessonContentIndex === 0
  // Determine the appropriate bubble text to display based on the current position in the learning flow, including whether the user is at the last content chunk or has quiz questions available.
  const lessonBubbleText =
    isLastContentChunk && currentLessonQuestions.length > 0
      ? 'Ready for a quick check?'
      : isLastContentChunk
        ? 'Nice work. Ready for the next step?'
        : "Let's keep going."

  // Prefer the scores the backend recorded, falling back to local scoring while nothing has been submitted yet.
  const gradedSubmissions = Object.values(submissions)
  const gradedPercentage = gradedSubmissions.length
    ? Math.round(
        gradedSubmissions.reduce((total, submission) => total + (submission.score ?? 0), 0) /
          gradedSubmissions.length,
      )
    : result.percentage
  const gradedPassed = gradedSubmissions.length
    ? gradedSubmissions.every((submission) => submission.passed)
    : result.passed

  // Only a passing lesson unlocks the next one.
  const canContinue = !hasQuiz || gradedPassed
  const continuePath = learnData.nextLessonId
    ? `${ROUTES.LEARN}/${learnData.moduleId}/${learnData.nextLessonId}`
    : ROUTES.LEARN

  if (phase === 'result') {
    // If the current phase is "result," render the result section, displaying the quiz results and providing options to try again or continue.
    return (
      <section className="mx-auto max-w-2xl space-y-8 px-2 py-12 sm:px-4 sm:py-16">
        <Card variant="quiz" className="space-y-6 p-7 text-center sm:p-10">
          <ProgressBar
            variant="illustrated"
            illustration="quiz"
            value={100}
            imageAlt="Lesson complete"
            imageWrapperClassName="mx-auto max-w-md"
            imageClassName="mx-auto w-full max-w-md"
            label="Lesson complete"
          />
          <h1 className="mt-6 font-heading text-h2 font-bold text-heading">
            {hasQuiz && !gradedPassed ? 'Nice try' : 'Congratulations!'}
          </h1>
          <p className="mt-2 text-lg font-semibold text-heading">
            {hasQuiz && !gradedPassed ? 'Keep practicing' : 'Lesson Completed'}
          </p>
          {hasQuiz ? (
            <>
              <p className="mt-4 text-foreground">Score: {gradedPercentage}%</p>

              <p className="text-foreground">{gradedPassed ? 'Pass' : 'Fail'}</p>
            </>
          ) : (
            <p className="mt-4 text-foreground">You reviewed every bite-sized lesson.</p>
          )}
          {/* Display any quiz error messages if present. */}
          {quizError ? <p className="text-sm font-medium text-danger">{quizError}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-4 pt-2">
            <Button variant="quizSecondary" disabled={isRetryLocked} onClick={retryLearnFlow}>
              Try again
            </Button>
            {/* If the user can continue to the next lesson, display the "Continue" button. */}
            {canContinue ? (
              <Link to={continuePath} className="inline-flex">
                <Button variant="quiz">Continue</Button>
              </Link>
            ) : null}
          </div>{' '}
        </Card>
      </section>
    )
  }
  // If the current phase is not "result," render the learning flow section, displaying the lesson content or quiz questions based on the current phase, along with navigation buttons to move between lessons and questions.
  return (
    <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
      <Card variant="quiz" className="px-7 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-6">
        <ProgressBar
          variant="illustrated"
          illustration="quiz"
          value={progressPercent}
          imageAlt="Learning progress"
          imageWrapperClassName="mx-auto max-w-md"
          imageClassName="mx-auto w-full max-w-md"
          label="Learning progress"
        />

        <div className="mt-4 space-y-3 text-center">
          <p className="text-small font-semibold uppercase tracking-wide text-primary">
            {learnData.moduleTitle}
          </p>

          <h1 className="font-heading text-h2 font-bold text-heading">{learnData.title}</h1>
          {/* If this is the first content chunk and a learning goal is provided, render the learning goal as a paragraph below the title. */}
          {isFirstContentChunk && learnData.learningGoal && (
            <p className="mx-auto max-w-xl leading-relaxed text-foreground">
              {learnData.learningGoal}
            </p>
          )}
        </div>
        {/* Render the lesson content or quiz questions based on the current phase, along with navigation buttons to move between lessons and questions. */}
        {phase === 'lesson' ? (
          <>
            <LessonComponent
              title={
                titlesOverlap(learnData.title, currentLesson?.title) ? null : currentLesson?.title
              }
              eyebrow={`Lesson ${lessonIndex + 1} of ${lessonSteps.length} • Step ${Math.min(lessonContentIndex + 1, currentLessonContentSteps)} of ${currentLessonContentSteps}`}
              content={currentContentItem ? [currentContentItem] : []}
              module={learnData.module}
              characterVariant={currentCharacterVariant}
              characterImage={currentCharacterImage}
              characterAlt={currentCharacterAlt}
              bubbleText={lessonBubbleText}
            />

            <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-primary/10 pt-6">
              <Button
                variant="quizSecondary"
                disabled={lessonIndex === 0 && lessonContentIndex === 0}
                onClick={goToPreviousLesson}
              >
                Previous
              </Button>

              <Button variant="quiz" className="min-w-36" onClick={goToNextLesson}>
                {isLastContentChunk && currentLessonQuestions.length > 0
                  ? 'Quick Check'
                  : 'Continue'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Render the quiz component for the current question. */}
            <QuizComponent
              question={currentQuestion}
              questionNumber={isQuizOnly ? questionIndex + 1 : questionPosition + 1}
              totalQuestions={isQuizOnly ? questions.length : currentLessonQuestions.length}
              selectedChoiceIds={selectedChoiceIds}
              reviewAnswer={reviewAnswer}
              onChange={setSelectedChoiceIds}
              rightAnswerIcon={rightAnswerIcon}
              wrongAnswerIcon={wrongAnswerIcon}
              characterVariant={currentCharacterVariant}
              characterImage={currentCharacterImage}
              characterAlt={currentCharacterAlt}
            />
            {/* If there is a quiz error, display it below the quiz component. */}
            {quizError ? (
              <p className="mt-4 text-center text-sm font-medium text-danger">{quizError}</p>
            ) : null}

            {/* Quiz navigation is forward-only, so no Previous button here. */}
            <div className="mt-8 flex flex-wrap justify-end gap-4 border-t border-primary/10 pt-6">
              {reviewAnswer ? (
                <Button variant="quiz" className="min-w-36" onClick={goToNextQuestion}>
                  {isLastQuestion ? 'View Results' : 'Continue'}
                </Button>
              ) : (
                <Button
                  variant="quiz"
                  className="min-w-40"
                  disabled={selectedChoiceIds.length === 0}
                  onClick={checkAnswer}
                >
                  Check Answer
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  )
}

function LearnPage({
  moduleData: providedModuleData,
  lessonData: providedLessonData,
  characterImages: providedCharacterImages,
  guideImage = dabbingBeaverImg,
}) {
  const { isAuthenticated, csrfToken } = useAuth()

  const { moduleId, lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const isSamplePreview = searchParams.get('sample') === 'true'

  const hasProvidedContent = Boolean(providedModuleData && providedLessonData)

  const {
    moduleData: fetchedModuleData,
    lessonData: fetchedLessonData,
    progress,
    isLoading,
    error,
  } = useLessonContent({
    moduleId,
    lessonId,
    enabled: isAuthenticated && !hasProvidedContent,
  })

  const sampleLesson = useMemo(() => {
    if (isAuthenticated || !isSamplePreview || hasProvidedContent) {
      return null
    }

    return getSampleLesson({ moduleId, lessonId })
  }, [hasProvidedContent, isAuthenticated, isSamplePreview, lessonId, moduleId])

  const learnData = useMemo(() => {
    return normalizeLearnData({
      moduleData: providedModuleData ?? fetchedModuleData ?? sampleLesson?.moduleData,
      lessonData: providedLessonData ?? fetchedLessonData ?? sampleLesson?.lessonData,
    })
  }, [fetchedLessonData, fetchedModuleData, providedLessonData, providedModuleData, sampleLesson])

  const characterImages = {
    abigail: abigailImg,
    ramona: ramonaImg,
    beaver: dabbingBeaverImg,
    guide: guideImage,
    ...providedCharacterImages,
  }

  if (!isAuthenticated) {
    // If the user isn't authenticated, but the page has a sample query parameter, allow them to view the sample lesson without authentication.
    if (isSamplePreview && learnData) {
      const randomLesson = selectRandomLesson(learnData.lessonSteps)
      return (
        <>
          <p className="mx-auto mb-4 max-w-5xl rounded-xl border border-primary/20 bg-danger/5 px-4 py-3 text-sm font-medium text-primary sm:px-6">
            This is a sample of a lesson.
          </p>
          <LearnFlow
            key={`${learnData.moduleId}:${learnData.id}`}
            learnData={randomLesson ? { ...learnData, lessonSteps: [randomLesson] } : learnData}
            characterImages={characterImages}
            guideImage={guideImage}
            isReadOnly
          />
        </>
      )
    }
    // If the user is not authenticated, redirect them to the login page. This ensures that only authenticated users can access the dashboard.
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  // If the content is still loading, display a loading skeleton to indicate that the lesson content is being fetched from the server.
  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Skeleton />
      </section>
    )
  }
  // If there is no learning data available, display a message indicating that the lesson is unavailable, along with a link to navigate back to the home page. This handles cases where the lesson content could not be loaded due to an error or missing data.
  if (!learnData) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Card className="space-y-5 bg-white p-7 sm:p-10">
          <h1 className="font-heading text-h3 font-bold text-heading">Lesson unavailable</h1>

          <p>{error || 'This learning content could not be loaded.'}</p>

          <Link to="/">Back home</Link>
        </Card>
      </section>
    )
  }

  return (
    <LearnFlow
      key={`${learnData.moduleId}:${learnData.id}`}
      learnData={learnData}
      characterImages={characterImages}
      guideImage={guideImage}
      savedProgress={progress}
      csrfToken={csrfToken}
    />
  )
}

export default LearnPage
