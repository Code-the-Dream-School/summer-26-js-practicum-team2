import { useEffect } from "react";
import { useLocation } from "react-router";
import AppRouter from "./app/router/AppRouter.jsx";
import { getRouteTitle } from "./app/router/routes.js";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getRouteTitle(pathname);
  }, [pathname]);

  return <AppRouter />;
}

export default App;
