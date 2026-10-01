import { useEffect } from "react";
import { useLocation } from "react-router";
import { applyInstanceTheme } from "./app/instanceTheme";
import AppRouter from "./app/router/AppRouter";
import { getRouteTitle } from "./app/router/routes";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyInstanceTheme();
  }, []);

  useEffect(() => {
    document.title = getRouteTitle(pathname);
  }, [pathname]);

  return <AppRouter />;
}

export default App;
