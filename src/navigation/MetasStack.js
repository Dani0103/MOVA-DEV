import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MetasScreen from "../screens/Metas/MetasScreen";
import CrearMetaScreen from "../screens/Metas/CrearMetaScreen";
import DetalleMetaScreen from "../screens/Metas/DetalleMetaScreen";

const Stack = createNativeStackNavigator();

export default function MetasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Metas" component={MetasScreen} />
      <Stack.Screen name="CrearMeta" component={CrearMetaScreen} />
      <Stack.Screen name="DetalleMeta" component={DetalleMetaScreen} />
    </Stack.Navigator>
  );
}
