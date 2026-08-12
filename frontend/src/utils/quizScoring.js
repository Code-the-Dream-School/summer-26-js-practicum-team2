export function normalizeChoiceIds(choiceIds = []) {
  if (!Array.isArray(choiceIds)) {
    return []
  }

  const validChoiceIds = choiceIds.filter(
    (choiceId) => typeof choiceId === 'string' && choiceId.trim().length > 0,
  )

  return [...new Set(validChoiceIds)]
}

export function scoreQuizAttempt({ questions = [], answers = [], passThreshold = 0.7 } = {}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : []
  const normalizedAnswers = Array.isArray(answers) ? answers : []

  const answerMap = new Map(
    normalizedAnswers.map((answer) => [
      answer.questionId,
      normalizeChoiceIds(answer.choiceIds ?? [answer.choiceId]).filter(Boolean),
    ]),
    
  )

  let correctCount = 0
  const missed = []

  normalizedQuestions.forEach((question) => {
    const correctChoiceIds = normalizeChoiceIds(question.correctChoiceIds)
    const selectedChoiceIds = answerMap.get(question.id) || []
    const isCorrect =
      selectedChoiceIds.length === correctChoiceIds.length &&
      selectedChoiceIds.every((choiceId) => correctChoiceIds.includes(choiceId))

    if (isCorrect) {
      correctCount += 1
    } else {
      missed.push({
        questionId: question.id,
        selectedChoiceIds,
        correctChoiceIds,
      })
    }
  })

  const totalQuestions = normalizedQuestions.length
  const score = totalQuestions === 0 ? 0 : correctCount / totalQuestions
  const percentage = Math.round(score * 100)
  const passed = totalQuestions > 0 && score >= passThreshold

  return {
    score,
    percentage,
    passed,
    missed,
    correctCount,
    totalQuestions,
  }
}
