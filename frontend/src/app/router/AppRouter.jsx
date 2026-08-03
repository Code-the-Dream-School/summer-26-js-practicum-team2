import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import MainLayout from '../../components/layout/MainLayout.jsx'
import Dashboard from '../../pages/Dashboard.jsx'
import HomePage from '../../pages/HomePage.jsx'
import NotFoundPage from '../../pages/NotFoundPage.jsx'
import DevComponentsPage from '../../pages/DevComponentsPage.jsx'
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
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.DEV_COMPONENTS,
        element: <DevComponentsPage />,
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
