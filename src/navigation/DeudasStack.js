import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeudasScreen from "../screens/Deudas/DeudasScreen";
import CrearDeudaScreen from "../screens/Deudas/CrearDeudaScreen";
import EditarDeudaScreen from "../screens/Deudas/EditarDeudaScreen";
import DetalleDeudaScreen from "../screens/Deudas/DetalleDeudaScreen";
import AddPagoDeudaScreen from "../screens/Deudas/AddPagoDeudaScreen";
import HistorialPagosDeudaScreen from "../screens/Deudas/HistorialPagosDeudaScreen";

const Stack = createNativeStackNavigator();

export default function DeudasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeudasHome" component={DeudasScreen} />
      <Stack.Screen name="CrearDeuda" component={CrearDeudaScreen} />
      <Stack.Screen name="EditarDeuda" component={EditarDeudaScreen} />
      <Stack.Screen name="DetalleDeuda" component={DetalleDeudaScreen} />
      <Stack.Screen name="AñadirPagoDeuda" component={AddPagoDeudaScreen} />
      <Stack.Screen name="HistorialPagosDeuda" component={HistorialPagosDeudaScreen} />
    </Stack.Navigator>
  );
}
