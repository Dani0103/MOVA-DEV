import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoriasScreen from "../screens/Categorias/CategoriasScreen";
import CrearCategoriaScreen from "../screens/Categorias/CrearCategoriaScreen";
import DetalleCategoriaScreen from "../screens/Categorias/DetalleCategoriaScreen";
// import DetalleCategoriaScreen from "../screens/Categorias/DetalleCategoriaScreen"; // Opcional

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
      {/* Podrías agregar una vista de detalle para ver estadísticas por categoría */}
    </Stack.Navigator>
  );
}
