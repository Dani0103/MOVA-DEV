import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import UpgradeModal from "../shared/UpgradeModal";

import Header from "./Header";
import HomeScreen from "../../screens/HomeScreen";
import InfoPersonal from "../../screens/InfoPersonal";
import CuentasStack from "../../navigation/CuentasStack";
import MovimientosStack from "../../navigation/MovimientosStack";
import CategoriasStack from "../../navigation/CategoriasStack";
import MetasStack from "../../navigation/MetasStack";
import DeudasStack from "../../navigation/DeudasStack";
import PresupuestosStack from "../../navigation/PresupuestosStack";
import RecurrentesStack from "../../navigation/RecurrentesStack";
import EstadisticasScreen from "../../screens/EstadisticasScreen";
import AdminScreen from "../../screens/Admin/AdminScreen";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/useTheme";

const Drawer = createDrawerNavigator();

export default function AppLayout({ navigation }) {
  const { user } = useAuth();
  const theme = useTheme();

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [attemptedSection, setAttemptedSection] = useState("");

  const isFreePlan = user?.plan?.id === 1;

  const handlePremiumPress = (e, sectionName) => {
    if (isFreePlan) {
      e.preventDefault();
      setAttemptedSection(sectionName);
      setShowPremiumModal(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          header: () => <Header />,
          drawerStyle: { backgroundColor: theme.drawerBackground, width: 240 },
          drawerLabelStyle: { color: theme.drawerActiveTint },
          drawerActiveBackgroundColor: theme.drawerActive,
          drawerActiveTintColor: theme.drawerActiveTint,
          drawerInactiveTintColor: theme.drawerInactiveTint,
          borderRadius: 0,
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Inicio" }}
        />
        <Drawer.Screen name="Cuentas" component={CuentasStack} />
        <Drawer.Screen name="Categorias" component={CategoriasStack} />
        <Drawer.Screen
          name="Movimientos"
          component={MovimientosStack}
          listeners={({ navigation }) => ({
            // Cuando el usuario toca "Movimientos" en el drawer,
            // reseteamos el stack interno para que siempre muestre
            // la lista, sin importar si antes estaba en DetalleMovimiento.
            drawerItemPress: (e) => {
              e.preventDefault();
              navigation.navigate("Movimientos", { screen: "Movimientos" });
            },
          })}
        />
        <Drawer.Screen name="Presupuestos" component={PresupuestosStack} />
        <Drawer.Screen name="Recurrentes" component={RecurrentesStack} />

        <Drawer.Screen
          name="Metas"
          component={MetasStack}
          listeners={{ drawerItemPress: (e) => handlePremiumPress(e, "Metas") }}
          options={{
            title: isFreePlan ? "Metas 🔒" : "Metas",
            drawerItemStyle: isFreePlan ? { opacity: 0.5 } : {},
          }}
        />
        <Drawer.Screen
          name="Deudas"
          component={DeudasStack}
          listeners={{ drawerItemPress: (e) => handlePremiumPress(e, "Deudas") }}
          options={{
            title: isFreePlan ? "Deudas 🔒" : "Deudas",
            drawerItemStyle: isFreePlan ? { opacity: 0.5 } : {},
          }}
        />
        <Drawer.Screen
          name="Estadísticas"
          component={EstadisticasScreen}
          listeners={{ drawerItemPress: (e) => handlePremiumPress(e, "Estadísticas") }}
          options={{
            title: isFreePlan ? "Estadísticas 🔒" : "Estadísticas",
            drawerItemStyle: isFreePlan ? { opacity: 0.5 } : {},
          }}
        />
        {user?.email === 'fepiperuiz11@gmail.com' && (
          <Drawer.Screen
            name="Admin"
            component={AdminScreen}
            options={{
              title: "Panel Admin",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="shield-checkmark-outline" size={size} color={color} />
              ),
            }}
          />
        )}
        <Drawer.Screen
          name="Perfil"
          component={InfoPersonal}
          options={{ title: "Perfil" }}
        />
      </Drawer.Navigator>

      <UpgradeModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title={`¡Desbloquea ${attemptedSection}!`}
        message="Esta función es exclusiva de nuestro plan Pro. Mejora tu cuenta para acceder a herramientas avanzadas y tomar el control total de tus finanzas."
      />
    </View>
  );
}

const styles = StyleSheet.create({});
