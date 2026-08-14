import { NavLink } from "react-router";
import NavBar from "./NavBar/NavBar.component.jsx";
import logo from "../../../assets/logo.svg";

function Header(props) {
  return (
    <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <NavLink to="/" aria-label="Sprout home">
        <img src={logo} alt="" className="w-28 sm:w-32 lg:w-36" />
      </NavLink>
      <NavBar {...props} />
    </header>
  );
}

export default Header;
