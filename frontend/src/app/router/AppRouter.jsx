import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import LoginPage from '../../pages/LoginPage.jsx'
import MainLayout from '../../components/layout/MainLayout.jsx'
import HomePage from '../../pages/HomePage.jsx'
import NotFoundPage from '../../pages/NotFoundPage.jsx'
import DevComponentsPage from '../../pages/DevComponentsPage.jsx'
import PrivacyPage from '../../pages/PrivacyPage.jsx'
import TermsPage from '../../pages/TermsPage.jsx'
import QuizPage from '../../pages/QuizPage.jsx'
import RegisterPage from '../../pages/RegisterPage.jsx'
import PasswordResetPage from '../../pages/PasswordResetPage.jsx'
import VerifyEmailPage from '../../pages/VerifyEmailPage.jsx'
import { ROUTES } from './routes.js'

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
        element: <QuizPage />,
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
