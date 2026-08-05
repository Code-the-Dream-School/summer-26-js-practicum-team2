import { useState } from 'react'
import { Outlet } from 'react-router'

function MainLayout() {

  const [signedIn, setSignedIn] = useState(false)

  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
   
      <NavBar signedIn={signedIn} />
      
      <div className="bg-heading text-on-primary text-xs p-2 text-center flex items-center justify-center gap-4">
        <span>Project State Monitor: User is {signedIn ? 'Signed In 🔓' : 'Signed Out 🔒'}</span>
        <button 
          onClick={() => setSignedIn(!signedIn)} 
          className="bg-surface-input text-heading font-bold px-3 py-1 rounded shadow text-xs hover:bg-surface-raised transition-all"
        >
          Toggle Login State
        </button>
      </div>

      <ConsentBanner />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <Outlet context={{ signedIn }} />
      </main>
      
      <Footer />
    </div>
  )
}

export default MainLayout
