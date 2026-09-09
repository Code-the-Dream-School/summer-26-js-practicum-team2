import { useEffect } from "react";
import { useLocation } from "react-router";
import AppRouter from "./app/router/AppRouter";
import { getRouteTitle } from "./app/router/routes";
import { useAuthContext } from "./context/AuthContext";
import useDashboardData from "./hooks/useDashboardData";
import { setProgressFavicon } from "./utils/progressFavicon";

function App() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { dashboard } = useDashboardData({ userId: user?.id, isAuthenticated });

  useEffect(() => {
    document.title = getRouteTitle(pathname);
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      setProgressFavicon(dashboard?.progress?.overallPercent);
    }
  }, [dashboard?.progress?.overallPercent, isAuthenticated]);

  return <AppRouter />;
}

export default App;
