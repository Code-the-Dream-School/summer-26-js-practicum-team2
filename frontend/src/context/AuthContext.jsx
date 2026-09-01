import { createContext, use } from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  const isAdmin = auth.user?.role === "admin";
  const value = {
    ...auth,
    isAdmin,
  };
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuthContext() {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }
  return ctx;
}
