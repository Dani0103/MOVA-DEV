import { View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Header from "./Header";
import HomeScreen from "../../screens/HomeScreen";
import InfoPersonal from "../../screens/InfoPersonal";
// import CuentasScreen from "../../screens/CuentasScreen";
// import MovimientosScreen from "../../screens/Movimientos/MovimientosScreen";
import CategoriasScreen from "../../screens/CategoriasScreen";
import MetasScreen from "../../screens/MetasScreen";
import DeudasScreen from "../../screens/DeudasScreen";
import EstadisticasScreen from "../../screens/EstadisticasScreen";
import CuentasStack from "../../navigation/CuentasStack";
import MovimientosStack from "../../navigation/MovimientosStack";

const Drawer = createDrawerNavigator();

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          header: () => <Header />,
          drawerStyle: { backgroundColor: "#0F172A" },
          drawerLabelStyle: { color: "white" },
          drawerActiveBackgroundColor: "#1E293B",
          drawerActiveTintColor: "white",
          drawerInactiveTintColor: "#94A3B8",
          borderRadius: 0,
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Inicio" }}
        />
        <Drawer.Screen name="Cuentas" component={CuentasStack} />
        <Drawer.Screen name="Movimientos" component={MovimientosStack} />
        <Drawer.Screen name="Categorías" component={CategoriasScreen} />
        <Drawer.Screen name="Metas" component={MetasScreen} />
        <Drawer.Screen name="Deudas" component={DeudasScreen} />
        <Drawer.Screen name="Estadísticas" component={EstadisticasScreen} />
        <Drawer.Screen
          name="Perfil"
          component={InfoPersonal}
          options={{ title: "Perfil" }}
        />
      </Drawer.Navigator>
    </View>
  );
}
