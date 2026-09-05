// Action names used by the quiz state machine so components can dispatch
// consistent events without relying on ad hoc string values.
export const actions = {
  startAttempt: "startAttempt",
  selectChoice: "selectChoice",
  revealAnswer: "revealAnswer",
  nextQuestion: "nextQuestion",
  previousQuestion: "previousQuestion",
  submitStart: "submitStart",
  submitSuccess: "submitSuccess",
  submitFailure: "submitFailure",
  resetAttempt: "resetAttempt",
};

export const initialState = {
  attemptId: null,
  questionIndex: 0,
  answers: {},
  reviews: {},
  status: "idle",
  result: null,
  errorMessage: "",
};

export default function quizReducer(state = initialState, action) {
  switch (action.type) {
    case actions.startAttempt:
      return {
        ...initialState,
        attemptId: action.attemptId ?? null,
        status: "active",
      };

    // Selecting is blocked once an answer is revealed, so the recorded choice stays authoritative.
    case actions.selectChoice:
      if (state.reviews[action.questionId]) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.choiceIds },
      };

    case actions.revealAnswer:
      return {
        ...state,
        reviews: {
          ...state.reviews,
          [action.questionId]: {
            isCorrect: action.isCorrect,
            explanation: action.explanation,
            correctChoiceIds: action.correctChoiceIds ?? [],
          },
        },
      };

    case actions.nextQuestion:
      return { ...state, questionIndex: state.questionIndex + 1 };

    case actions.previousQuestion:
      return { ...state, questionIndex: Math.max(state.questionIndex - 1, 0) };

    case actions.submitStart:
      return { ...state, status: "submitting", errorMessage: "" };

    case actions.submitSuccess:
      return { ...state, status: "submitted", result: action.result };

    case actions.submitFailure:
      return { ...state, status: "error", errorMessage: action.errorMessage };

    case actions.resetAttempt:
      return initialState;

    default:
      return state;
  }
}
