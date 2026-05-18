import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { GetCategories } from "../services/CategoriaService";
import { useAuth } from "./AuthContext";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [cachedUserId, setCachedUserId] = useState(null);

  // Limpia el caché automáticamente cuando cambia el usuario (login con otra cuenta o logout)
  useEffect(() => {
    setCategorias([]);
    setLastFetched(null);
    setCachedUserId(null);
  }, [user?.id]);

  const refreshCategories = useCallback(
    async (token, userId, force = false) => {
      const now = Date.now();
      const currentUserId = user?.id ?? userId ?? null;

      // Usa caché solo si los datos son del mismo usuario y tienen menos de 5 minutos
      if (
        !force &&
        categorias.length > 0 &&
        lastFetched &&
        now - lastFetched < 300000 &&
        cachedUserId === currentUserId
      ) {
        return categorias;
      }

      try {
        setLoading(true);
        // El backend ya filtra por usuario autenticado (token) — no se necesita filtro adicional
        const response = await GetCategories(token);
        const data = response.data ?? [];

        setCategorias(data);
        setLastFetched(now);
        setCachedUserId(currentUserId);
        return data;
      } catch (error) {
        console.error("Error al cargar categorías en context:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [categorias, lastFetched, cachedUserId, user?.id],
  );

  const clearCategoryData = useCallback(() => {
    setCategorias([]);
    setLastFetched(null);
    setCachedUserId(null);
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categorias,
        loading,
        refreshCategories,
        setCategorias,
        clearCategoryData,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories debe usarse dentro de un CategoryProvider");
  }
  return context;
};
