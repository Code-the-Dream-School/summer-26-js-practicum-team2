import { Route, Routes } from "react-router";
import { ROUTES } from "./routes";
import MainLayout from "../../shared/MainLayout/MainLayout.component";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import HomePage from "../../pages/HomePage";
import LoginPage from "../../pages/LoginPage";
import RegisterPage from "../../pages/RegisterPage";
import VerifyEmailPage from "../../pages/VerifyEmailPage";
import PasswordResetPage from "../../pages/PasswordResetPage";
import ProfilePage from "../../pages/ProfilePage";
import DashboardPage from "../../pages/DashboardPage";
import LearningPathPage from "../../pages/LearningPathPage";
import LearnPage from "../../pages/LearnPage";
import LastLessonRedirect from "../../pages/LastLessonRedirect";
import PrivacyPage from "../../pages/PrivacyPage";
import TermsPage from "../../pages/TermsPage";
import NotFoundPage from "../../pages/NotFoundPage";
import AdminDashboardPage from "../../pages/AdminDashboardPage";

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
          path={ROUTES.ADMIN}
          element={
            <RoleProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </RoleProtectedRoute>
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
