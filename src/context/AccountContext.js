import React, { createContext, useState, useContext, useCallback } from "react";
import { GetAccount } from "../services/CuentaService";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  // Función para obtener cuentas desde la API
  const refreshAccounts = useCallback(
    async (token, force = false) => {
      // Si ya tenemos datos y no han pasado más de 5 minutos, no consultamos (Caché básica)
      const now = Date.now();
      if (
        !force &&
        cuentas.length > 0 &&
        lastFetched &&
        now - lastFetched < 300000
      ) {
        return cuentas;
      }

      try {
        setLoading(true);
        const response = await GetAccount(token);
        setCuentas(response.data);
        setLastFetched(now);
        return response.data;
      } catch (error) {
        console.error("Error al cargar cuentas en context:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cuentas, lastFetched],
  );

  // Función para limpiar el context (útil al hacer Logout)
  const clearAccountData = () => {
    setCuentas([]);
    setLastFetched(null);
  };

  return (
    <AccountContext.Provider
      value={{
        cuentas,
        loading,
        refreshAccounts,
        setCuentas, // Permite actualizaciones locales (optimistic updates)
        clearAccountData,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
