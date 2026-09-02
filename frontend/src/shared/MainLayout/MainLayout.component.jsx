import { useState } from "react";
import { Outlet } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import Header from "./Header/Header.component";
import Footer from "./Footer/Footer.component";
import ConsentBanner from "../../features/legal/ConsentBanner/ConsentBanner.component";

export default function MainLayout() {
  const { isAuthenticated, user, profile, logout } = useAuthContext();

  console.log("PROFILE IN MAINLAYOUT", profile);

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
        xp={profile?.xp ?? 0}
        streak={profile?.current_streak ?? 0}
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
