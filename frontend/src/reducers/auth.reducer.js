// Action type constants
export const actions = {
  hydrateComplete: "hydrateComplete",
  startRequest: "startRequest",
  endRequest: "endRequest",
  commitAuth: "commitAuth",
  clearAuth: "clearAuth",
  updateCsrfToken: "updateCsrfToken",
  setError: "setError",
  clearError: "clearError",
};

// Initial auth state
export const initialState = {
  user: null,
  csrfToken: null,
  isHydrating: true, // True while loading persisted auth data
  isSubmitting: false, // True during auth requests
  errorMessage: "",
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    // Complete hydration of auth state from persistent storage
    case actions.hydrateComplete:
      return {
        ...state,
        user: action.user ?? null,
        csrfToken: action.csrfToken ?? null,
        isHydrating: false,
      };

    // Start an auth request, clear any previous errors
    case actions.startRequest:
      return { ...state, isSubmitting: true, errorMessage: "" };

    // Complete an auth request without committing changes
    case actions.endRequest:
      return { ...state, isSubmitting: false };

    // Successfully authenticate - update user and token
    case actions.commitAuth:
      return {
        ...state,
        user: action.user,
        csrfToken: action.csrfToken ?? null,
        isSubmitting: false,
        errorMessage: "",
      };

    // Logout - clear user and token
    case actions.clearAuth:
      return { ...state, user: null, csrfToken: null, isSubmitting: false };

    case actions.updateCsrfToken:
      return { ...state, csrfToken: action.csrfToken ?? state.csrfToken };

    // Set error message from failed auth request
    case actions.setError:
      return {
        ...state,
        errorMessage: action.errorMessage,
        isSubmitting: false,
      };

    // Clear error message
    case actions.clearError:
      return { ...state, errorMessage: "" };

    default:
      return state;
  }
}
