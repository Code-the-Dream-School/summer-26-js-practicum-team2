import { useState } from "react";
import NavBar from "./NavBar/NavBar.component";
import useAuth from "../../../hooks/useAuth";

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const handleLogout = async () => {
    setIsSigningOut(true);
    await logout()
      .catch((error) => {
        console.error("Logout failed:", error);
      })
      .finally(() => {
        setIsSigningOut(false);
      });
  };
  return (
    <NavBar
      signedIn={isAuthenticated}
      avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
      onLogout={handleLogout}
      isSigningOut={isSigningOut}
    />
  );
}

export default Header;
