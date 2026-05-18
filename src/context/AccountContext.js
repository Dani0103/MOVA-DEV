import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { GetAccount } from "../services/CuentaService";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const { user } = useAuth();

  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [cachedUserId, setCachedUserId] = useState(null);

  // Limpia el caché automáticamente cuando cambia el usuario (login con otra cuenta o logout)
  useEffect(() => {
    setCuentas([]);
    setLastFetched(null);
    setCachedUserId(null);
  }, [user?.id]);

  const refreshAccounts = useCallback(
    async (token, force = false) => {
      const now = Date.now();
      const currentUserId = user?.id ?? null;

      // Usa caché solo si los datos son del mismo usuario y tienen menos de 5 minutos
      if (
        !force &&
        cuentas.length > 0 &&
        lastFetched &&
        now - lastFetched < 300000 &&
        cachedUserId === currentUserId
      ) {
        return cuentas;
      }

      try {
        setLoading(true);
        const response = await GetAccount(token);
        setCuentas(response.data);
        setLastFetched(now);
        setCachedUserId(currentUserId);
        return response.data;
      } catch (error) {
        console.error("Error al cargar cuentas en context:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cuentas, lastFetched, cachedUserId, user?.id],
  );

  const clearAccountData = useCallback(() => {
    setCuentas([]);
    setLastFetched(null);
    setCachedUserId(null);
  }, []);

  return (
    <AccountContext.Provider
      value={{
        cuentas,
        loading,
        refreshAccounts,
        setCuentas,
        clearAccountData,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
