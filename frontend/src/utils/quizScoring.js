// Small cleanup step: only real string IDs are kept, and duplicates are stripped.
// The rest of the flow just uses the cleaned list as a stable source of truth.
export function normalizeChoiceIds(choiceIds = []) {
  // If the input is not an array at all, the safest fallback is an empty list.
  if (!Array.isArray(choiceIds)) {
    return [];
  }

  // Trim the noise: blank strings and anything else that is not a string are ignored.
  const validChoiceIds = choiceIds.filter(
    (choiceId) => typeof choiceId === "string" && choiceId.trim().length > 0,
  );

  // Deduplicate while preserving the original order; this keeps the result predictable.
  return [...new Set(validChoiceIds)];
}

// The scoring routine walks the question list and compares it to the answer map.
// In practice, this is mostly a set comparison wrapped in a pass/fail check.
export function scoreQuizAttempt({ questions = [], answers = [], passThreshold = 0.7 } = {}) {
  // Guard the incoming data so the function behaves even with partially broken input.
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedAnswers = Array.isArray(answers) ? answers : [];

  // Build a lookup by question ID; answer records are normalized before they are used.
  const answerMap = new Map(
    normalizedAnswers.map((answer) => [
      answer.questionId,
      normalizeChoiceIds(answer.choiceIds ?? [answer.choiceId]).filter(Boolean),
    ]),
  );

  // Track the count of correct questions and the ones that missed the mark.
  let correctCount = 0;
  const missed = [];

  normalizedQuestions.forEach((question) => {
    // The expected answer set is normalized the same way as the selected one.
    const correctChoiceIds = normalizeChoiceIds(question.correctChoiceIds);
    const selectedChoiceIds = answerMap.get(question.id) || [];

    // Exact match means same number of correct IDs and every selected ID is valid.
    const isCorrect =
      selectedChoiceIds.length === correctChoiceIds.length &&
      selectedChoiceIds.every((choiceId) => correctChoiceIds.includes(choiceId));

    if (isCorrect) {
      correctCount += 1;
    } else {
      // The debug trail is intentionally verbose so a failed question can be inspected later.
      missed.push({
        questionId: question.id,
        selectedChoiceIds,
        correctChoiceIds,
      });
    }
  });

  // Final scoring is a simple ratio of correct answers to total questions.
  const totalQuestions = normalizedQuestions.length;
  const score = totalQuestions === 0 ? 0 : correctCount / totalQuestions;
  const percentage = Math.round(score * 100);
  const passed = totalQuestions > 0 && score >= passThreshold;

  // Return the summary object used by the UI and any reporting layer.
  return {
    score,
    percentage,
    passed,
    missed,
    correctCount,
    totalQuestions,
  };
}

// Combines per-micro-lesson quiz submissions into one lesson-wide result.
export function aggregateLessonScore(submissions = [], passThreshold = 0.7) {
  const normalizedSubmissions = Array.isArray(submissions) ? submissions : [];

  const totalQuestions = normalizedSubmissions.reduce(
    (total, submission) => total + (submission?.totalQuestions ?? 0),
    0,
  );

  const missedCount = normalizedSubmissions.reduce(
    (total, submission) => total + (submission?.missed?.length ?? 0),
    0,
  );

  // The correct count is derived from the total and missed counts, and is clamped to zero.
  const correctCount = Math.max(totalQuestions - missedCount, 0);
  // The final score is the ratio of correct answers to total questions, with a fallback to zero if there are no questions.
  const score = totalQuestions === 0 ? 0 : correctCount / totalQuestions;
  // The percentage is the score expressed as a whole number, and the pass/fail status is determined by the threshold.
  const percentage = Math.round(score * 100);
  // The pass/fail status is determined by whether the score meets or exceeds the threshold, and there are questions to evaluate.
  const passed = totalQuestions > 0 && score >= passThreshold;

  return { percentage, passed, totalQuestions, missedCount, correctCount };
}
