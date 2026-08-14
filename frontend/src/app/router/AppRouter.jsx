import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import MainLayout from "../../components/layout/MainLayout.jsx";
import HomePage from "../../pages/HomePage.jsx";
import NotFoundPage from "../../pages/NotFoundPage.jsx";
import { ROUTES } from "./routes.js";
import LearningPathPage from "../../pages/LearningPathPage.jsx";
import LessonPage from "../../pages/LessonPage.jsx";

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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
