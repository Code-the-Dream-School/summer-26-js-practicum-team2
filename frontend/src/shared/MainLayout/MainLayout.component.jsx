import { useState } from "react";
import { Outlet } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import Header from "./Header/Header.component";
import Footer from "./Footer/Footer.component";
import ConsentBanner from "../../features/legal/ConsentBanner/ConsentBanner.component";

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthContext();
  //add for admin update
  const isAdmin = user?.role === "admin";
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
        isAdmin={isAdmin}
        avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
        onLogout={handleLogout}
        isSigningOut={isSigningOut}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}
