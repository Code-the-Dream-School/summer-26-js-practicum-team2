import { useState } from "react";
import { Outlet } from "react-router";
import Header from "./Header/Header.component.jsx";
import Footer from "./Footer/Footer.component.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
      <Header
        signedIn={isAuthenticated}
        avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
        onLogout={handleLogout}
        isSigningOut={isSigningOut}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
