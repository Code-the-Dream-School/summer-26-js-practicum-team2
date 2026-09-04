import { Navigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import Spinner from "../../shared/Spinner/Spinner.component";
import { ROUTES } from "./routes";

export default function RoleProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isHydrating, user } = useAuthContext();

  if (isHydrating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role !== requiredRole) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
}
