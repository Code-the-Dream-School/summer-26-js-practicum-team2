import { Route, Routes } from "react-router";
import { ROUTES } from "./routes.js";
import MainLayout from "../../components/layout/MainLayout.component.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import HomePage from "../../pages/HomePage.jsx";
import LoginPage from "../../pages/LoginPage.jsx";
import RegisterPage from "../../pages/RegisterPage.jsx";
import VerifyEmailPage from "../../pages/VerifyEmailPage.jsx";
import PasswordResetPage from "../../pages/PasswordResetPage.jsx";
import ProfilePage from "../../pages/ProfilePage.jsx";
import DashboardPage from "../../pages/DashboardPage.jsx";
import LearningPathPage from "../../pages/LearningPathPage.jsx";
import LearnPage from "../../pages/LearnPage.jsx";
import LastLessonRedirect from "../../pages/LastLessonRedirect.jsx";
import PrivacyPage from "../../pages/PrivacyPage.jsx";
import TermsPage from "../../pages/TermsPage.jsx";
import NotFoundPage from "../../pages/NotFoundPage.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.PASSWORD_RESET} element={<PasswordResetPage />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
        <Route path={ROUTES.TERMS} element={<TermsPage />} />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.LEARN}
          element={
            <ProtectedRoute>
              <LearningPathPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.LAST_LESSON}
          element={
            <ProtectedRoute>
              <LastLessonRedirect />
            </ProtectedRoute>
          }
        />

        {/* Public so unauthenticated visitors can preview a sample lesson. */}
        <Route path={ROUTES.LEARN_LESSON} element={<LearnPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
