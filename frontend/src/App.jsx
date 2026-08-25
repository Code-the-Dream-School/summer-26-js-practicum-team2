import { useEffect } from "react";
import { useLocation } from "react-router";
import AppRouter from "./app/router/AppRouter";
import { getRouteTitle } from "./app/router/routes";
// Import your custom onboarding controller hook
import { useOnboarding } from "./features/onboarding/useOnboarding";

function App() {
  const { pathname } = useLocation();

  //Instantiate the state machine hook at the root level of your tree
  const onboarding = useOnboarding();

  useEffect(() => {
    document.title = getRouteTitle(pathname);
  }, [pathname]);

  return <AppRouter />;

   // Pass the onboarding configuration variables straight into your router tree
  return <AppRouter onboarding={onboarding} />;
}

export default App;
