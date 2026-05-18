import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MetasScreen from "../screens/Metas/MetasScreen";
import CrearMetaScreen from "../screens/Metas/CrearMetaScreen";
import EditarMetaScreen from "../screens/Metas/EditarMetaScreen";
import DetalleMetaScreen from "../screens/Metas/DetalleMetaScreen";
import AddAhorroScreen from "../screens/Metas/AddAhorroScreen";
import HistorialAportesScreen from "../screens/Metas/HistorialAportesScreen";

const Stack = createNativeStackNavigator();

export default function MetasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Metas" component={MetasScreen} />
      <Stack.Screen name="CrearMeta" component={CrearMetaScreen} />
      <Stack.Screen name="EditarMeta" component={EditarMetaScreen} />
      <Stack.Screen name="DetalleMeta" component={DetalleMetaScreen} />
      <Stack.Screen name="AñadirAhorro" component={AddAhorroScreen} />
      <Stack.Screen name="HistorialAportes" component={HistorialAportesScreen} />
    </Stack.Navigator>
  );
}
