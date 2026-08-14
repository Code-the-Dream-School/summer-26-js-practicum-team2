import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./app/router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
