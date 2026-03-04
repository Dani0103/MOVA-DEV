import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native"; // 🔹 Importante

import MovimientosScreen from "../screens/Movimientos/MovimientosScreen";
import CrearMovimientoScreen from "../screens/Movimientos/CrearMovimientoScreen";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountContext";
import { loadMovimientos } from "../services/MovimientosService";
import { useCategories } from "../context/CategoryContext";

const Stack = createNativeStackNavigator();

export default function MovimientosStack() {
  const navigation = useNavigation(); // 🔹 Hook necesario para el listener 'focus'
  const { user, token } = useAuth();
  const { cuentas, refreshAccounts, setCuentas } = useAccounts();
  const { categorias, refreshCategories } = useCategories();

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Definimos la carga de movimientos en una función reusable
  const fetchMovimientosData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loadMovimientos(token);
      console.log("🚀 ~ MovimientosStack ~ response:", response);
      // Laravel suele devolver { data: [...] }, asegúrate de acceder a .data
      setMovimientos(response.data || response);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // 1. Carga inicial
    refreshAccounts(token);
    refreshCategories(token, user.id);
    fetchMovimientosData();

    // 2. 🔹 Recargar cuando el usuario entra al stack (al volver de crear movimiento)
    const unsubscribe = navigation.addListener("focus", () => {
      refreshAccounts(token);
      refreshCategories(token, user.id);
      fetchMovimientosData();
    });

    return unsubscribe;
  }, [
    navigation,
    token,
    user.id,
    refreshAccounts,
    refreshCategories,
    fetchMovimientosData,
  ]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Movimientos">
        {(props) => (
          <MovimientosScreen
            {...props}
            movimientos={movimientos}
            loading={loading}
            onRefresh={fetchMovimientosData} // Para un pull-to-refresh
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="CrearMovimiento">
        {(props) => (
          <CrearMovimientoScreen
            {...props}
            movimientos={movimientos}
            setMovimientos={setMovimientos}
            cuentas={cuentas} // Cuentas vienen del contexto global
            setCuentas={setCuentas} // 🔹 Importante para el update del saldo
            categorias={categorias}
            onSuccess={fetchMovimientosData} // Callback para refrescar tras guardar
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
