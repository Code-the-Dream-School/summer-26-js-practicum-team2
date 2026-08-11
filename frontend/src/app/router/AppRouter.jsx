import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import LoginPage from '../../pages/LoginPage.jsx'
import MainLayout from '../../components/layout/MainLayout.jsx'
import Dashboard from '../../pages/DashboardPage.jsx'
import HomePage from '../../pages/HomePage.jsx'
import NotFoundPage from '../../pages/NotFoundPage.jsx'
import DevComponentsPage from '../../pages/DevComponentsPage.jsx'
import PrivacyPage from '../../pages/PrivacyPage.jsx'
import TermsPage from '../../pages/TermsPage.jsx'
import LearnPage from '../../pages/LearnPage.jsx'
import RegisterPage from '../../pages/RegisterPage.jsx'
import PasswordResetPage from '../../pages/PasswordResetPage.jsx'
import VerifyEmailPage from '../../pages/VerifyEmailPage.jsx'
import { ROUTES } from './routes.js'
import LearningPathPage from '../../pages/LearningPathPage.jsx'
import LessonPage from '../../pages/LessonPage.jsx'

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.LEARN,
        element: <LearningPathPage />,
      },
      {
        path: ROUTES.LESSON,
        element: <LessonPage />,
      },
      {
        path: ROUTES.LEARN_LESSON,
        element: <LearnPage />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.LESSON,
        element: <LessonPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.VERIFY_EMAIL,
        element: <VerifyEmailPage />,
      },
      {
        path: ROUTES.PASSWORD_RESET,
        element: <PasswordResetPage />,
      },
      {
        path: ROUTES.DEV_COMPONENTS,
        element: <DevComponentsPage />,
      },
      {
        path: ROUTES.PRIVACY,
        element: <PrivacyPage />,
      },
      {
        path: ROUTES.TERMS,
        element: <TermsPage />,
      },
      {
        path: ROUTES.QUIZ,
        element: <LearnPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
