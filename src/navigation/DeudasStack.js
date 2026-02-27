import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeudasScreen from "../screens/Deudas/DeudasScreen";
import CrearDeudaScreen from "../screens/Deudas/CrearDeudaScreen";
import DetalleDeudaScreen from "../screens/Deudas/DetalleDeudaScreen";

const Stack = createNativeStackNavigator();

export default function DeudasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeudasHome" component={DeudasScreen} />
      <Stack.Screen name="CrearDeuda" component={CrearDeudaScreen} />
      <Stack.Screen name="DetalleDeuda" component={DetalleDeudaScreen} />
    </Stack.Navigator>
  );
}
