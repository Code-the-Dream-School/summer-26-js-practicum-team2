import { useState } from "react";
import NavBar from "./NavBar/NavBar.component";
import useAuth from "../../../hooks/useAuth";
import { NavLink } from "react-router";
import logo from "../../../assets/logo.svg";

function Header(props) {
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
    <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 ">
      <NavLink to="/" aria-label="Sprout home">
        <img src={logo} alt="" className="w-28 sm:w-32 lg:w-36" />
      </NavLink>
      <NavBar
        signedIn={isAuthenticated}
        avatarLabel={user?.name?.charAt(0)?.toUpperCase() || "A"}
        onLogout={handleLogout}
        isSigningOut={isSigningOut}
        {...props}
      />
    </header>
  );
}

export default Header;
