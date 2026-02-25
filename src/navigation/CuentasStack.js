import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CuentasScreen from "../screens/Cuentas/CuentasScreen";
import CrearCuentaScreen from "../screens/Cuentas/CrearCuentaScreen";
import DetalleCuentaScreen from "../screens/Cuentas/DetalleCuentaScreen";

const Stack = createNativeStackNavigator();

export default function CuentasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CuentasHome" component={CuentasScreen} />
      <Stack.Screen name="CrearCuenta" component={CrearCuentaScreen} />
      <Stack.Screen name="DetalleCuenta" component={DetalleCuentaScreen} />
    </Stack.Navigator>
  );
}
