import { createContext, use } from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthContext value={auth}>{children}</AuthContext>;
}

export function useAuthContext() {
  const ctx = use(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }
  return ctx;
}
