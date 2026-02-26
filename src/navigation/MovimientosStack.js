import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native"; // 🔹 Importante

import MovimientosScreen from "../screens/Movimientos/MovimientosScreen";
import CrearMovimientoScreen from "../screens/Movimientos/CrearMovimientoScreen";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountContext";
import { loadMovimientos } from "../services/MovimientosService";

const Stack = createNativeStackNavigator();

export default function MovimientosStack() {
  const navigation = useNavigation(); // 🔹 Hook necesario para el listener 'focus'
  const { token } = useAuth();
  const { cuentas, refreshAccounts } = useAccounts();

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Definimos la carga de movimientos en una función reusable
  const fetchMovimientosData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loadMovimientos(token);
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
    fetchMovimientosData();

    // 2. 🔹 Recargar cuando el usuario entra al stack (al volver de crear movimiento)
    const unsubscribe = navigation.addListener("focus", () => {
      refreshAccounts(token);
      fetchMovimientosData();
    });

    return unsubscribe;
  }, [navigation, token, refreshAccounts, fetchMovimientosData]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovimientosHome">
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
            onSuccess={fetchMovimientosData} // Callback para refrescar tras guardar
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
