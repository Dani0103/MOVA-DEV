import React, { createContext, useState, useContext, useCallback } from "react";
import { GetCategories } from "../services/CategoriaService";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  // Función para obtener categorías desde la API
  const refreshCategories = useCallback(
    async (token, userId, force = false) => {
      const now = Date.now();
      // Caché básica de 5 minutos
      if (
        !force &&
        categorias.length > 0 &&
        lastFetched &&
        now - lastFetched < 300000
      ) {
        return categorias;
      }

      try {
        setLoading(true);
        const response = await GetCategories(token);

        // Filtramos por el usuario aquí mismo para que el context
        // solo guarde lo que le pertenece al usuario logueado
        const filterCategory = response.data.filter(
          (e) => e.usuario_id === userId,
        );

        setCategorias(filterCategory);
        setLastFetched(now);
        return filterCategory;
      } catch (error) {
        console.error("Error al cargar categorías en context:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [categorias, lastFetched],
  );

  const clearCategoryData = () => {
    setCategorias([]);
    setLastFetched(null);
  };

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
