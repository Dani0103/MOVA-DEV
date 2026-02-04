import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { AUTH_KEYS } from "../constants/authKeys";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Cargar sesión al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = await storage.get(AUTH_KEYS.TOKEN);
      const storedUser = await storage.get(AUTH_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async ({ token, user }) => {
    setLoading(true);
    await storage.set(AUTH_KEYS.TOKEN, token);
    await storage.set(AUTH_KEYS.USER, user);
    setToken(token);
    setUser(user);
    setLoading(false);
  };

  const logout = async () => {
    await storage.remove(AUTH_KEYS.TOKEN);
    await storage.remove(AUTH_KEYS.USER);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
