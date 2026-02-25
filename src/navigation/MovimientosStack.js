import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";

import MovimientosScreen from "../screens/Movimientos/MovimientosScreen";
import CrearMovimientoScreen from "../screens/Movimientos/CrearMovimientoScreen";

const Stack = createNativeStackNavigator();

export default function MovimientosStack() {
  const [movimientos, setMovimientos] = useState([]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovimientosHome">
        {(props) => <MovimientosScreen {...props} movimientos={movimientos} />}
      </Stack.Screen>

      <Stack.Screen name="CrearMovimiento">
        {(props) => (
          <CrearMovimientoScreen
            {...props}
            movimientos={movimientos}
            setMovimientos={setMovimientos}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
