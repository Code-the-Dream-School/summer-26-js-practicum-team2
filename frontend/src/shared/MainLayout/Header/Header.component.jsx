import { NavLink } from "react-router";
import NavBar from "./NavBar/NavBar.component";
import { APP_NAME } from "../../../app/router/routes";

function Header(props) {
  return (
    <header className="relative z-50 flex items-center justify-between border-b border-neutral-200 bg-surface-raised px-4 py-3 sm:px-6 lg:px-8">
      <NavLink to="/" aria-label={`${APP_NAME} home`} className="font-heading text-xl font-bold">
        {APP_NAME}
      </NavLink>
      <NavBar {...props} />
    </header>
  );
}

export default Header;
