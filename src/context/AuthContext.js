import { createContext, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (authData) => {
    setLoading(true);
    await SecureStore.setItemAsync("token", authData.token);
    setUser(authData.user);
    setToken(authData.token);
    setLoading(false);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    setToken(null);
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
