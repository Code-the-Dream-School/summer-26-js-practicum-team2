import { AuthProvider } from "./context/AuthContext.jsx";
import AppRouter from "./app/router/AppRouter.jsx";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
