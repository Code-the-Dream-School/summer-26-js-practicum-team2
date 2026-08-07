import { useState } from 'react'
import { Outlet } from 'react-router'
import NavBar from '../ui/NavBar.jsx'
import ConsentBanner from '../ui/ConsentBanner.jsx'
import Footer from '../ui/Footer.jsx'
import useAuth from '../../hooks/useAuth.js'

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await logout()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
      <NavBar
        signedIn={isAuthenticated}
        avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'A'}
        onLogout={handleLogout}
        isSigningOut={isSigningOut}
      />
      <ConsentBanner />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <Outlet />
      </main>
      
      <Footer />
      
    </div>
  )
}

export default MainLayout
