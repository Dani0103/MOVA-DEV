import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RecurrentesScreen from "../screens/Recurrentes/RecurrentesScreen";
import CrearRecurrenteScreen from "../screens/Recurrentes/CrearRecurrenteScreen";

const Stack = createNativeStackNavigator();

export default function RecurrentesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Recurrentes" component={RecurrentesScreen} />
      <Stack.Screen name="CrearRecurrente" component={CrearRecurrenteScreen} />
    </Stack.Navigator>
  );
}
