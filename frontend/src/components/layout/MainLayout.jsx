import { Outlet } from 'react-router'
import NavBar from '../ui/NavBar.jsx'
import ConsentBanner from '../ui/ConsentBanner.jsx'

function MainLayout() {
  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
      <NavBar />
      <ConsentBanner />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
