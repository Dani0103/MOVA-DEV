import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PresupuestosScreen from "../screens/Presupuestos/PresupuestosScreen";
import CrearPresupuestoScreen from "../screens/Presupuestos/CrearPresupuestoScreen";

const Stack = createNativeStackNavigator();

export default function PresupuestosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Presupuestos" component={PresupuestosScreen} />
      <Stack.Screen name="CrearPresupuesto" component={CrearPresupuestoScreen} />
    </Stack.Navigator>
  );
}
