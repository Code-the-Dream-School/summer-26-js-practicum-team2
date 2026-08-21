// Base URL is determined by the VITE_API_BASE_URL environment variable, which can be set in the .env file.
// Removes trailing slashes from the URL to ensure consistent path construction
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const USERS_BASE_PATH = `${API_BASE_URL}/api/v1/users`;
const DASHBOARD_BASE_PATH = `${API_BASE_URL}/api/v1/dashboard`;
const LESSONS_BASE_PATH = `${API_BASE_URL}/api/v1/lessons`;
const QUIZZES_BASE_PATH = `${API_BASE_URL}/api/v1/quizzes`;
const ADMIN_BASE_PATH = `${API_BASE_URL}/api/v1/admin`;

// Helper function to make API requests to the backend.
async function apiRequest(path, options = {}) {
  const { method = "GET", body, csrfToken, headers = {}, basePath = USERS_BASE_PATH } = options;

  const isFormData = body instanceof FormData;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (isFormData) delete requestHeaders["Content-Type"];

  if (csrfToken && ["POST", "PATCH", "PUT", "DELETE", "CONNECT"].includes(method.toUpperCase())) {
    requestHeaders["X-CSRF-TOKEN"] = csrfToken;
  }

  const response = await fetch(`${basePath}${path}`, {
    method,
    credentials: "include",
    headers: requestHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  // Checks if the response is JSON and parses it if it is, otherwise returns null
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  // If the response is not OK, throw an error
  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed. Please try again.");
    error.status = response.status;
    error.errors = Array.isArray(payload?.errors) ? payload.errors : [];
    throw error;
  }
  return payload;
}

export const registerUser = (formData) =>
  apiRequest("/register", {
    method: "POST",
    body: formData,
  });

export const loginUser = (credentials) =>
  apiRequest("/login", {
    method: "POST",
    body: credentials,
  });

export const logoutUser = (csrfToken) =>
  apiRequest("/logout", {
    method: "POST",
    csrfToken,
  });

export const verifyUserEmail = (token) => apiRequest(`/verify?token=${encodeURIComponent(token)}`);

export const forgotPasswordRequest = (email) =>
  apiRequest("/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resetPasswordRequest = (token, newPassword) =>
  apiRequest("/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });

export const getDashboard = () =>
  apiRequest("", {
    method: "GET",
    basePath: DASHBOARD_BASE_PATH,
  });

export const getAdminUsers = ({ page, limit, role, emailVerified, search } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (role) params.set("role", role);
  if (emailVerified !== undefined) params.set("emailVerified", emailVerified);
  if (search) params.set("search", search);
  const query = params.toString();
  return apiRequest(`/users${query ? `?${query}` : ""}`, {
    method: "GET",
    basePath: ADMIN_BASE_PATH,
  });
};

export const getAdminModules = () =>
  apiRequest("/modules", { method: "GET", basePath: ADMIN_BASE_PATH });

export const seedAdminBudgetingModule = (csrfToken) =>
  apiRequest("/modules/seed-budgeting", {
    method: "POST",
    csrfToken,
    basePath: ADMIN_BASE_PATH,
  });

export const createAdminModule = ({ module, csrfToken }) =>
  apiRequest("/modules", { method: "POST", csrfToken, body: module, basePath: ADMIN_BASE_PATH });

export const updateAdminModule = ({ moduleId, updates, csrfToken }) =>
  apiRequest(`/modules/${encodeURIComponent(moduleId)}`, {
    method: "PATCH",
    csrfToken,
    body: updates,
    basePath: ADMIN_BASE_PATH,
  });

export const deleteAdminModule = ({ moduleId, csrfToken }) =>
  apiRequest(`/modules/${encodeURIComponent(moduleId)}`, {
    method: "DELETE",
    csrfToken,
    basePath: ADMIN_BASE_PATH,
  });

export const createAdminLesson = ({ moduleId, lesson, csrfToken }) =>
  apiRequest(`/modules/${encodeURIComponent(moduleId)}/lessons`, {
    method: "POST",
    csrfToken,
    body: lesson,
    basePath: ADMIN_BASE_PATH,
  });

export const deleteAdminLesson = ({ moduleId, lessonId, csrfToken }) =>
  apiRequest(`/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}`, {
    method: "DELETE",
    csrfToken,
    basePath: ADMIN_BASE_PATH,
  });

export const updateAdminUserRole = ({ userId, role, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    csrfToken,
    body: { role, confirmation: "CONFIRM" },
    basePath: ADMIN_BASE_PATH,
  });

export const setAdminUserDisabled = ({ userId, disabled, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}/disabled`, {
    method: "PATCH",
    csrfToken,
    body: { disabled, confirmation: "CONFIRM" },
    basePath: ADMIN_BASE_PATH,
  });

export const resetAdminUserProgress = ({ userId, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}/progress/reset`, {
    method: "POST",
    csrfToken,
    body: { confirmation: "CONFIRM" },
    basePath: ADMIN_BASE_PATH,
  });

export const verifyAdminUserEmail = ({ userId, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}/verify-email`, {
    method: "PATCH",
    csrfToken,
    body: { confirmation: "CONFIRM" },
    basePath: ADMIN_BASE_PATH,
  });

export const setAdminUserDeleted = ({ userId, deleted, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}/deleted`, {
    method: "PATCH",
    csrfToken,
    body: { confirmation: "CONFIRM", deleted },
    basePath: ADMIN_BASE_PATH,
  });

export const hardDeleteAdminUser = ({ userId, email, csrfToken }) =>
  apiRequest(`/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    csrfToken,
    body: { confirmation: "CONFIRM", email },
    basePath: ADMIN_BASE_PATH,
  });

export const importAdminLessonModule = ({ file, csrfToken }) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/modules/import", {
    method: "POST",
    csrfToken,
    body: formData,
    basePath: ADMIN_BASE_PATH,
  });
};

// Dispatches a custom event to notify the application that dashboard progress has been updated
// This allows other components to listen for this event and update their state accordingly
export const notifyDashboardProgressChanged = () => {
  window.dispatchEvent(new Event("sprout:progress-updated"));
};

// Tracks a dashboard event by sending it to the backend and notifying listeners of progress changes
// type: the event type to track
// csrfToken: CSRF token for security
// payload: additional event data to send to the server (spread into the request body)
export const trackDashboardEvent = async ({ type, csrfToken, ...payload }) => {
  const response = await apiRequest("/events", {
    method: "POST",
    csrfToken,
    body: { type, ...payload },
    basePath: DASHBOARD_BASE_PATH,
  });

  // Notify listeners that dashboard progress has changed
  notifyDashboardProgressChanged();
  return response;
};

export const getLesson = (moduleId, lessonId) =>
  apiRequest(`/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}`, {
    method: "GET",
    basePath: LESSONS_BASE_PATH,
  });

export const getPublicLesson = (moduleId, lessonId) =>
  apiRequest(`/public/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}`, {
    method: "GET",
    basePath: LESSONS_BASE_PATH,
  });

export const checkQuizAnswer = ({ moduleId, microLessonId, questionId, choiceIds }) =>
  apiRequest("/check", {
    method: "POST",
    body: { moduleId, microLessonId, questionId, choiceIds },
    basePath: QUIZZES_BASE_PATH,
  });

export const getLastLesson = () =>
  apiRequest("/last", {
    method: "GET",
    basePath: LESSONS_BASE_PATH,
  });

export const getLessonProgress = (moduleId) =>
  apiRequest(`/progress?moduleId=${encodeURIComponent(moduleId)}`, {
    method: "GET",
    basePath: LESSONS_BASE_PATH,
  });

export const updateLessonProgress = ({ moduleId, lessonId, microLessonId, csrfToken }) =>
  apiRequest("/progress", {
    method: "PATCH",
    csrfToken,
    body: { moduleId, lessonId, microLessonId },
    basePath: LESSONS_BASE_PATH,
  });

export const getQuizProgress = () =>
  apiRequest("/progress", {
    method: "GET",
    basePath: QUIZZES_BASE_PATH,
  });

export const getQuizAttempts = () =>
  apiRequest("/attempts", {
    method: "GET",
    basePath: QUIZZES_BASE_PATH,
  });

export const startQuiz = ({ moduleId, microLessonId, csrfToken }) =>
  apiRequest("/start", {
    method: "POST",
    csrfToken,
    body: { moduleId, microLessonId },
    basePath: QUIZZES_BASE_PATH,
  });

// Submitting a quiz changes lesson progress, so the cached dashboard is invalidated alongside it.
export const submitQuiz = async (microLessonId, { attemptId, moduleId, answers, csrfToken }) => {
  const response = await apiRequest(`/${encodeURIComponent(microLessonId)}/submit`, {
    method: "POST",
    csrfToken,
    body: { attemptId, moduleId, answers },
    basePath: QUIZZES_BASE_PATH,
  });

  notifyDashboardProgressChanged();
  return response;
};
