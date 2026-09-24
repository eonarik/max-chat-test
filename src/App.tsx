import { useAuth } from "./hooks/useAuth";

import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { Sprite } from "./components/Sprite";

function App() {
  const { isAuthenticated, login, logout, apiClient, credentials } = useAuth();

  if (!isAuthenticated || !apiClient || !credentials) {
    return (
      <div className="h-screen w-screen bg-gray-100 overflow-hidden">
        <Login onLogin={login} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      <Sprite />
      <Chat apiClient={apiClient} credentials={credentials} onLogout={logout} />
    </div>
  );
}

export default App;
