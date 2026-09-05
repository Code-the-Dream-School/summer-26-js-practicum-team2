import { Navigate, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../shared/Spinner/Spinner.component";
import { ROUTES } from "./routes";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isHydrating } = useAuthContext();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
  }
  if (user?.role !== "admin") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
