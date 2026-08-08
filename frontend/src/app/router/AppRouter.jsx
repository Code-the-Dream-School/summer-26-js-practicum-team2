import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import MainLayout from '../../components/layout/MainLayout.jsx'
import HomePage from '../../pages/HomePage.jsx'
import NotFoundPage from '../../pages/NotFoundPage.jsx'
import DevComponentsPage from '../../pages/DevComponentsPage.jsx'
import PrivacyPage from '../../pages/PrivacyPage.jsx'
import TermsPage from '../../pages/TermsPage.jsx'
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
