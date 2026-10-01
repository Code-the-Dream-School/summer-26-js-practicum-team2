import { NavLink } from "react-router";
import NavBar from "./NavBar/NavBar.component";
import { APP_NAME } from "../../../app/router/routes";
import { APP_LOGO_URL } from "../../../app/instanceAssets";

function Header(props) {
  return (
    <header className="relative z-50 flex items-center justify-between border-b border-neutral-200 bg-surface-raised px-4 py-3 sm:px-6 lg:px-8">
      <NavLink
        to="/"
        aria-label={`${APP_NAME} home`}
        className="flex min-h-10 items-center font-heading text-xl font-bold"
      >
        {APP_LOGO_URL ? (
          <img src={APP_LOGO_URL} alt={APP_NAME} className="max-h-10 max-w-36 object-contain" />
        ) : (
          APP_NAME
        )}
      </NavLink>
      <NavBar {...props} />
    </header>
  );
}

export default Header;
