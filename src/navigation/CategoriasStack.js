import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoriasScreen from "../screens/Categorias/CategoriasScreen";
import CrearCategoriaScreen from "../screens/Categorias/CrearCategoriaScreen";
import DetalleCategoriaScreen from "../screens/Categorias/DetalleCategoriaScreen";
import CategoriasInactivasScreen from "../screens/Categorias/CategoriasInactivasScreen";

const Stack = createNativeStackNavigator();

export default function CategoriasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Categorias" component={CategoriasScreen} />
      <Stack.Screen name="CrearCategoria" component={CrearCategoriaScreen} />
      <Stack.Screen
        name="DetalleCategoria"
        component={DetalleCategoriaScreen}
      />
      <Stack.Screen
        name="CategoriasInactivas"
        component={CategoriasInactivasScreen}
      />
    </Stack.Navigator>
  );
}
