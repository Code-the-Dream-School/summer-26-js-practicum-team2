import { useCallback, useMemo, useReducer } from "react";
import quizReducer, { actions, initialState } from "../reducers/quiz.reducer.js";
import { startQuiz, submitQuiz } from "../services/api.js";
import { scoreQuizAttempt } from "../utils/quizScoring.js";

export function useQuiz({
  questions = [],
  moduleId,
  passThreshold = 0.7,
  csrfToken,
  isReadOnly = false,
}) {
  const [quizState, dispatch] = useReducer(quizReducer, initialState);

  const currentQuestion = questions[quizState.questionIndex] ?? null;
  const selectedChoiceIds = useMemo(
    // Keep the selection scoped to the question currently shown.
    () => (currentQuestion ? (quizState.answers[currentQuestion.id] ?? []) : []),
    [currentQuestion, quizState.answers],
  );
  const review = currentQuestion ? (quizState.reviews[currentQuestion.id] ?? null) : null;

  const begin = useCallback(
    async (microLessonId) => {
      if (isReadOnly || !csrfToken) {
        dispatch({ type: actions.startAttempt, attemptId: null });
        return;
      }

      try {
        const attempt = await startQuiz({ moduleId, microLessonId, csrfToken });
        dispatch({ type: actions.startAttempt, attemptId: attempt.attemptId });
      } catch (error) {
        // A 409 means the 5s cooldown is still active; the quiz can still run locally.
        dispatch({ type: actions.startAttempt, attemptId: null });
        dispatch({ type: actions.submitFailure, errorMessage: error.message });
      }
    },
    [csrfToken, isReadOnly, moduleId],
  );

  const selectChoice = useCallback((questionId, choiceIds) => {
    dispatch({ type: actions.selectChoice, questionId, choiceIds });
  }, []);

  const checkAnswer = useCallback((question, choiceIds) => {
    // Score one question independently so feedback can be shown immediately.
    const { passed } = scoreQuizAttempt({
      questions: [question],
      answers: [{ questionId: question.id, choiceIds }],
      passThreshold: 1,
    });

    dispatch({
      type: actions.revealAnswer,
      questionId: question.id,
      isCorrect: passed,
      explanation: question.explanation,
    });
  }, []);

  const goToNextQuestion = useCallback(() => dispatch({ type: actions.nextQuestion }), []);
  const goToPreviousQuestion = useCallback(() => dispatch({ type: actions.previousQuestion }), []);
  const reset = useCallback(() => dispatch({ type: actions.resetAttempt }), []);

  const submit = useCallback(
    async (microLessonId, lessonQuestions) => {
      // Calculate a local result first so read-only quizzes behave like submitted ones.
      const localResult = scoreQuizAttempt({
        questions: lessonQuestions,
        answers: lessonQuestions.map((question) => ({
          questionId: question.id,
          choiceIds: quizState.answers[question.id] ?? [],
        })),
        passThreshold,
      });

      if (isReadOnly || !csrfToken) {
        const offlineResult = {
          score: localResult.percentage,
          passed: localResult.passed,
          missed: localResult.missed,
        };
        dispatch({ type: actions.submitSuccess, result: offlineResult });
        return offlineResult;
      }

      dispatch({ type: actions.submitStart });

      const answerPayload = Object.fromEntries(
        // The API expects answers keyed by question ID rather than an array.
        lessonQuestions.map((question) => [question.id, quizState.answers[question.id] ?? []]),
      );

      try {
        const submission = await submitQuiz(microLessonId, {
          attemptId: quizState.attemptId,
          moduleId,
          answers: answerPayload,
          csrfToken,
        });
        dispatch({ type: actions.submitSuccess, result: submission });
        return submission;
      } catch (error) {
        dispatch({ type: actions.submitFailure, errorMessage: error.message });
        return null;
      }
    },
    [csrfToken, isReadOnly, moduleId, passThreshold, quizState.answers, quizState.attemptId],
  );

  return useMemo(
    () => ({
      ...quizState,
      currentQuestion,
      selectedChoiceIds,
      review,
      begin,
      selectChoice,
      checkAnswer,
      goToNextQuestion,
      goToPreviousQuestion,
      submit,
      reset,
    }),
    [
      begin,
      checkAnswer,
      currentQuestion,
      goToNextQuestion,
      goToPreviousQuestion,
      quizState,
      reset,
      review,
      selectChoice,
      selectedChoiceIds,
      submit,
    ],
  );
}
