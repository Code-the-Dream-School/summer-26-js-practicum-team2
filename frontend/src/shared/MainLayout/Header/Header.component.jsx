import { NavLink } from "react-router";
import NavBar from "./NavBar/NavBar.component";
import logo from "../../../assets/logo.svg";

function Header(props) {
  return (
    // <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    //changes in line 9 is so we can see all of the menu links from hamburger menu which were cut off before with prior styling
    <header className="relative z-50 flex items-center justify-between border-b border-neutral-200 bg-surface-raised px-4 py-3 sm:px-6 lg:px-8">

      <NavLink to="/" aria-label="Sprout home">
        <img src={logo} alt="" className="w-28 sm:w-32 lg:w-36" />
      </NavLink>
      <NavBar {...props} />
    </header>
  );
}

export default Header;
