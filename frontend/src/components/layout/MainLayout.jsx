import { useState } from 'react'
import { Outlet } from 'react-router'

function MainLayout() {

  return (
    <div className="mx-auto min-h-screen bg-surface-app text-foreground">
   
      <NavBar />
    

      <ConsentBanner />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <Outlet />
      </main>
      
      <Footer />
      
    </div>
  )
}

export default MainLayout
