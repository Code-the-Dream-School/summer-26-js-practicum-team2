import { useCallback, useEffect, useMemo, useReducer } from "react";
import authReducer, { actions, initialState } from "../reducers/auth.reducer";
import * as api from "../services/api";

const STORAGE_KEY = "sprout.auth";

// Prefer the session store for a normal browser session, but fall back to persistent storage
// so a previously remembered user can still be restored on a refresh.
const readStoredAuth = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// "Remember me" promotes the session to localStorage; the other store is cleared so only one wins.
const writeStoredAuth = (data, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
  other.removeItem(STORAGE_KEY);
};

const clearStoredAuth = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
};

export function useAuth() {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const { user, csrfToken } = authState;

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    dispatch({ type: actions.clearAuth });
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => clearAuth();
    window.addEventListener(api.AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(api.AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [clearAuth]);

  // Restore the current auth state from browser storage on first mount.
  useEffect(() => {
    let isActive = true;

    const hydrateAuth = async () => {
      const stored = readStoredAuth();
      const isRemembered =
        !sessionStorage.getItem(STORAGE_KEY) && Boolean(localStorage.getItem(STORAGE_KEY));
      let user = stored?.user ?? null;
      let csrfToken = stored?.csrfToken ?? null;

      if (user) {
        try {
          const profile = await api.getProfile();
          if (profile?.user) {
            user = { ...user, ...profile.user };
            writeStoredAuth({ user, csrfToken }, isRemembered);
          }
        } catch (error) {
          if (error.status === 401) {
            clearStoredAuth();
            user = null;
            csrfToken = null;
          }
        }
      }

      if (!isActive) return;
      dispatch({
        type: actions.hydrateComplete,
        user,
        csrfToken,
      });
    };

    hydrateAuth();
    return () => {
      isActive = false;
    };
  }, []);

  // Keep the reducer and browser storage in sync whenever auth data changes.
  const commitAuth = useCallback((payload, remember = false) => {
    writeStoredAuth({ user: payload.user, csrfToken: payload.csrfToken }, remember);
    dispatch({
      type: actions.commitAuth,
      user: payload.user,
      csrfToken: payload.csrfToken,
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: actions.clearError });
  }, []);

  // Centralize loading/error handling so each API call follows the same reducer flow.
  const runRequest = useCallback(async (request) => {
    dispatch({ type: actions.startRequest });
    try {
      const payload = await request();
      dispatch({ type: actions.endRequest });
      return payload;
    } catch (error) {
      dispatch({ type: actions.setError, errorMessage: error.message });
      throw error;
    }
  }, []);

  const register = useCallback((form) => runRequest(() => api.registerUser(form)), [runRequest]);

  const login = useCallback(
    async ({ email, password, remember = false }) => {
      const payload = await runRequest(() => api.loginUser({ email, password, remember }));
      commitAuth(payload, remember);
      return payload;
    },
    [runRequest, commitAuth],
  );

  const logout = useCallback(async () => {
    try {
      await api.logoutUser(csrfToken);
    } finally {
      clearAuth();
    }
  }, [csrfToken, clearAuth]);

  const verifyEmail = useCallback(
    async (token) => {
      const payload = await runRequest(() => api.verifyUserEmail(token));
      commitAuth(payload, false);
      return payload;
    },
    [runRequest, commitAuth],
  );

  const requestPasswordReset = useCallback(
    (email) => runRequest(() => api.forgotPasswordRequest(email)),
    [runRequest],
  );

  const confirmPasswordReset = useCallback(
    async (token, newPassword) => {
      const payload = await runRequest(() => api.resetPasswordRequest(token, newPassword));
      commitAuth(payload, false);
      return payload;
    },
    [runRequest, commitAuth],
  );

  return useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      verifyEmail,
      requestPasswordReset,
      confirmPasswordReset,
      clearError,
    }),
    [
      authState,
      user,
      register,
      login,
      logout,
      verifyEmail,
      requestPasswordReset,
      confirmPasswordReset,
      clearError,
    ],
  );
}
