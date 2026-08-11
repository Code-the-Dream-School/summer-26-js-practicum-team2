import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { modules } from '../../../shared/content/index.js'
import LessonComponent from '../components/learn/LessonComponent.jsx'
import QuizComponent from '../components/learn/QuizComponent.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import dabbingBeaverImg from '../assets/dabbingBeaver.svg'
import abigailImg from '../assets/abigail.svg'
import ramonaImg from '../assets/ramona.svg'
import rightAnswerIcon from '../assets/right_answer.svg'
import wrongAnswerIcon from '../assets/wrong_answer.svg'
import { scoreQuizAttempt } from '../utils/quizScoring.js'

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
    // Find the character introduction content item, if it exists, to extract the character ID.
    const characterIntro = content.find((item) => item.type === 'characterIntro')
    // Return a normalized lesson step object with the micro-lesson ID, title, character ID, and filtered content (excluding knowledge check items).
    return {
      id: microLesson.id,
      title: microLesson.title,
      characterId: characterIntro?.characterId,
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
  return {
    id: lessonData.id,
    moduleId: moduleData?.id,
    moduleTitle: moduleData?.title,
    title: lessonData.title,
    learningGoal: lessonData.learningGoal,
    passThreshold: (lessonData.passingScore ?? 70) / 100,
    lessonSteps,
    questions,
  }
}
// Helper function to get the default lesson data based on the provided module ID and lesson ID. If the specified module or lesson is not found, it falls back to a default module and lesson.
function getDefaultLesson({ moduleId, lessonId }) {
  // Get the module data based on the provided module ID. If the module is not found, fall back to the default "cashFlow" module.
  const moduleData = modules[moduleId] ?? modules.cashFlow
  // Get the lesson data based on the provided lesson ID. If the lesson is not found, fall back to the first lesson in the module.
  const lessonData =
    moduleData?.lessons?.find((lesson) => lesson.id === lessonId) ?? moduleData?.lessons?.[0]
  // Return the module data and lesson data as an object.
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

// The LearnFlow component manages the learning flow, including lesson steps, quiz questions, and the result phase.
function LearnFlow({ learnData, characterImages, guideImage }) {
  // Destructure the lesson steps and questions from the learnData object for easier access.
  const lessonSteps = learnData.lessonSteps
  // Destructure the questions from the learnData object for easier access.
  const questions = learnData.questions
  // Initialize the phase state based on the starting phase determined by the presence of lesson steps and questions.
  const [phase, setPhase] = useState(() => getStartingPhase(lessonSteps, questions))
  // Initialize state variables for the current lesson index, question index, selected choice IDs, answers, and review answer.
  const [lessonIndex, setLessonIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedChoiceIds, setSelectedChoiceIds] = useState([])
  const [answers, setAnswers] = useState([])
  const [reviewAnswer, setReviewAnswer] = useState(null)
  // Get the current lesson and question based on the current indices.
  const currentLesson = lessonSteps[lessonIndex]
  const currentQuestion = questions[questionIndex]
  // Determine if there are any quiz questions available.
  const hasQuiz = questions.length > 0
  // Get the character ID for the current lesson, if available.
  const currentCharacterId = currentLesson?.characterId
  // Set the current character image and alt text based on the character ID. If no character ID is available, use the default guide image and alt text.
  let currentCharacterImage = guideImage
  let currentCharacterAlt = 'Sprout lesson guide'

  if (currentCharacterId) {
    // If a character ID is available, get the corresponding character image from the characterImages object.
    currentCharacterImage = characterImages[currentCharacterId]
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
  // Calculate the total number of steps in the learning flow, including lesson steps and quiz questions.
  const totalSteps = lessonSteps.length + questions.length
  // Calculate the number of completed steps before the current lesson, including both lesson steps and quiz questions.
  let completedStepsBeforeLesson = 0
  // Iterate through the lesson steps before the current lesson and count the number of completed steps, including both lesson steps and quiz questions.
  lessonSteps.slice(0, lessonIndex).forEach((lesson) => {
    const lessonQuestionCount = questions.filter(
      (question) => question.lessonStepId === lesson.id,
    ).length
    // Add the lesson step itself and the number of quiz questions associated with that lesson to the completed steps count.
    completedStepsBeforeLesson += 1 + lessonQuestionCount
  })
  // Calculate the current step in the learning flow based on the phase, completed steps before the lesson, and the position of the current question.
  let currentStep = completedStepsBeforeLesson

  if (phase === 'quiz') {
    // If the current phase is "quiz," increment the current step by 1 for the current lesson and add the position of the current question within the lesson. If the answer is being reviewed, add an additional step for the review.
    currentStep += 1 + Math.max(questionPosition, 0) + (reviewAnswer ? 1 : 0)
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
  // Function to reset the learning flow to the starting phase, resetting all relevant state variables to their initial values.
  function resetLearnFlow() {
    setPhase(getStartingPhase(lessonSteps, questions))
    setLessonIndex(0)
    setQuestionIndex(0)
    setSelectedChoiceIds([])
    setAnswers([])
    setReviewAnswer(null)
  }
  // Function to navigate to the next lesson step or quiz question, updating the relevant state variables based on the current phase and position within the learning flow.
  function goToNextLesson() {
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
      // Return early to prevent further execution of the function.
      return
    }

    if (lessonIndex < lessonSteps.length - 1) {
      // If there are more lesson steps available, navigate to the next lesson step and reset the selected choices and review answer.
      setLessonIndex((currentIndex) => currentIndex + 1)
      return
    }
    // If there are no more lesson steps and no quiz questions, switch to the "result" phase to indicate that the learning flow is complete.
    setPhase('result')
  }

  function goToPreviousLesson() {
    // If the current lesson index is greater than 0, navigate to the previous lesson step and reset the selected choices and review answer.
    setLessonIndex((currentIndex) => Math.max(currentIndex - 1, 0))
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
      ...currentAnswers.filter((answer) => answer.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        choiceIds: selectedChoiceIds,
      },
    ])

    setReviewAnswer({
      isCorrect: scoredAnswer.passed,
      explanation: currentQuestion.explanation,
    })
  }

  function goToPreviousQuestion() {
    // If there is no current question, return early to prevent further execution of the function.
    const previousQuestion = currentLessonQuestions[questionPosition - 1]

    if (!previousQuestion) {
      return
    }

    const previousQuestionIndex = questions.findIndex(
      (question) => question.id === previousQuestion.id,
    )

    const previousAnswer = answers.find((answer) => answer.questionId === previousQuestion.id)

    setQuestionIndex(previousQuestionIndex)
    setSelectedChoiceIds(previousAnswer?.choiceIds ?? [])
  }

  function goToNextQuestion() {
    // If there is no current question, return early to prevent further execution of the function.
    const nextQuestion = currentLessonQuestions[questionPosition + 1]

    if (nextQuestion) {
      // If there is a next question available, navigate to the next question, resetting the selected choices and review answer.
      const nextQuestionIndex = questions.findIndex((question) => question.id === nextQuestion.id)

      const previousAnswer = answers.find((answer) => answer.questionId === nextQuestion.id)

      setQuestionIndex(nextQuestionIndex)
      setSelectedChoiceIds(previousAnswer?.choiceIds ?? [])
      setReviewAnswer(null)

      return
    }

    if (lessonIndex < lessonSteps.length - 1) {
      // If there are more lesson steps available, navigate to the next lesson step, resetting the selected choices and review answer, and switch to the "lesson" phase.
      setLessonIndex((currentIndex) => currentIndex + 1)
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
    lessonIndex === lessonSteps.length - 1 && questionPosition === currentLessonQuestions.length - 1

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
            {hasQuiz && !result.passed ? 'Nice try' : 'Congratulations!'}
          </h1>

          <p className="mt-2 text-lg font-semibold text-heading">
            {hasQuiz && !result.passed ? 'Keep practicing' : 'Lesson Completed'}
          </p>

          {hasQuiz ? (
            <>
              <p className="mt-4 text-foreground">Score: {result.percentage}%</p>

              <p className="text-foreground">{result.passed ? 'Pass' : 'Fail'}</p>
            </>
          ) : (
            <p className="mt-4 text-foreground">You reviewed every bite-sized lesson.</p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4 pt-2">
            <Button variant="quizSecondary" onClick={resetLearnFlow}>
              Try again
            </Button>

            <Link to="/learn" className="inline-flex">
              <Button variant="quiz">Continue</Button>
            </Link>
          </div>
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

          {learnData.learningGoal && (
            <p className="mx-auto max-w-xl leading-relaxed text-foreground">
              {learnData.learningGoal}
            </p>
          )}
        </div>
          {/* // Render the lesson content or quiz questions based on the current phase, along with navigation buttons to move between lessons and questions. */}
        {phase === 'lesson' ? (
          <>
            <LessonComponent
              title={currentLesson?.title}
              eyebrow={`Lesson ${lessonIndex + 1} of ${lessonSteps.length}`}
              content={currentLesson?.content}
              characterImage={currentCharacterImage}
              characterAlt={currentCharacterAlt}
              bubbleText={
                lessonIndex === lessonSteps.length - 1 && hasQuiz
                  ? 'Ready for a quick check?'
                  : 'One bite at a time!'
              }
            />

            <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-primary/10 pt-6">
              <Button
                variant="quizSecondary"
                disabled={lessonIndex === 0}
                onClick={goToPreviousLesson}
              >
                Previous
              </Button>

              <Button variant="quiz" className="min-w-36" onClick={goToNextLesson}>
                {currentLessonQuestions.length > 0 ? 'Quick Check' : 'Next'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <QuizComponent
              question={currentQuestion}
              questionNumber={questionPosition + 1}
              totalQuestions={currentLessonQuestions.length}
              selectedChoiceIds={selectedChoiceIds}
              reviewAnswer={reviewAnswer}
              onChange={setSelectedChoiceIds}
              rightAnswerIcon={rightAnswerIcon}
              wrongAnswerIcon={wrongAnswerIcon}
            />

            <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-primary/10 pt-6">
              <Button
                variant="quizSecondary"
                disabled={questionPosition <= 0 || Boolean(reviewAnswer)}
                onClick={goToPreviousQuestion}
              >
                Previous
              </Button>

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
  const { moduleId, lessonId } = useParams()

  const learnData = useMemo(() => {
    const defaultLesson = getDefaultLesson({
      moduleId,
      lessonId,
    })

    return normalizeLearnData({
      moduleData: providedModuleData ?? defaultLesson.moduleData,
      lessonData: providedLessonData ?? defaultLesson.lessonData,
    })
  }, [lessonId, moduleId, providedLessonData, providedModuleData])

  if (!learnData) {
    return (
      <section className="mx-auto max-w-2xl px-2 py-12 sm:px-4 sm:py-16">
        <Card className="space-y-5 bg-white p-7 sm:p-10">
          <h1 className="font-heading text-h3 font-bold text-heading">Lesson unavailable</h1>

          <p>This learning content could not be loaded.</p>

          <Link to="/">Back home</Link>
        </Card>
      </section>
    )
  }

  const characterImages = {
    abigailImg,
    ramonaImg,
    dabbingBeaverImg,
    ...providedCharacterImages,
  }

  return (
    <LearnFlow
      key={`${learnData.moduleId}:${learnData.id}`}
      learnData={learnData}
      characterImages={characterImages}
      guideImage={guideImage}
    />
  )
}

export default LearnPage
