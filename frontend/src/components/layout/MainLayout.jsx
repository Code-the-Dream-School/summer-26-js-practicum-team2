import { Outlet } from "react-router";
import Footer from "../ui/Footer";

function MainLayout() {
  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
