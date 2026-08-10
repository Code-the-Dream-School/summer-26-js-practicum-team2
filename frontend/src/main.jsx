import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


// ///mycode///
// const userIsSignedIn = false; 

// function initializeUserInterfaceAuthRouter() {
//     if (!userIsSignedIn) return;

//     const primaryButtonCTA = document.getElementById('primary-cta');
//     const navigationBarCTA = document.getElementById('nav-cta');
    
  
//     if (primaryButtonCTA) {
//         primaryButtonCTA.textContent = "Continue learning";
//         primaryButtonCTA.setAttribute('href', '/dashboard');
//     }
    
//     if (navigationBarCTA) {
//         navigationBarCTA.textContent = "Continue learning";
//         navigationBarCTA.setAttribute('href', '/dashboard');
//     }
// }

// document.addEventListener('DOMContentLoaded', initializeUserInterfaceAuthRouter);
