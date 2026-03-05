import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import MovimientosScreen from "../screens/Movimientos/MovimientosScreen";
import CrearMovimientoScreen from "../screens/Movimientos/CrearMovimientoScreen";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountContext";
import { loadMovimientos } from "../services/MovimientosService";
import { useCategories } from "../context/CategoryContext";

const Stack = createNativeStackNavigator();

export default function MovimientosStack() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { cuentas, refreshAccounts, setCuentas } = useAccounts();
  const { categorias, refreshCategories } = useCategories();

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Carga de movimientos (siempre trae datos frescos)
  const fetchMovimientosData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loadMovimientos(token);
      setMovimientos(response.data || response);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. 🔹 EXTRAEMOS cargarTodo Y LE DAMOS LA OPCIÓN DE FORZAR (romper caché)
  const cargarTodo = useCallback(
    async (force = false) => {
      // Si force es true, le decimos a los contextos que ignoren los 5 minutos de caché
      await refreshAccounts(token, force);
      await refreshCategories(token, user.id, force);
      await fetchMovimientosData();
    },
    [token, user.id, refreshAccounts, refreshCategories, fetchMovimientosData],
  );

  // 3. useEffect ahora solo llama a nuestra función externa
  useEffect(() => {
    // Ejecutamos la carga inicial (sin forzar, usando caché si la hay)
    cargarTodo(false);

    // Agregamos el listener para cuando el usuario regrese a este Stack
    const unsubscribe = navigation.addListener("focus", () => {
      cargarTodo(false);
    });

    return unsubscribe;
  }, []); // Ahora es seguro poner cargarTodo en las dependencias

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Movimientos">
        {(props) => (
          <MovimientosScreen
            {...props}
            movimientos={movimientos}
            loading={loading}
            // 🔹 4. Le pasamos cargarTodo(true) al pull-to-refresh
            onRefresh={() => cargarTodo(true)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="CrearMovimiento">
        {(props) => (
          <CrearMovimientoScreen
            {...props}
            movimientos={movimientos}
            setMovimientos={setMovimientos}
            cuentas={cuentas}
            setCuentas={setCuentas}
            categorias={categorias}
            // 🔹 5. Le pasamos cargarTodo(true) para que recargue todo tras guardar
            onSuccess={() => cargarTodo(true)}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
