import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

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
        <Drawer.Screen name="Movimientos" component={MovimientosStack} />
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
        <Drawer.Screen
          name="Perfil"
          component={InfoPersonal}
          options={{ title: "Perfil" }}
        />
      </Drawer.Navigator>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPremiumModal}
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={40} color="#F59E0B" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              ¡Desbloquea {attemptedSection}!
            </Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              Esta función es exclusiva de nuestro plan Premium. Mejora tu
              cuenta para acceder a herramientas avanzadas y tomar el control
              total de tus finanzas.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowPremiumModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                  Quizás luego
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => {
                  setShowPremiumModal(false);
                  navigation.navigate("Planes");
                }}
              >
                <Text style={styles.upgradeBtnText}>Ver Planes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
    borderTopWidth: 1,
  },
  iconContainer: {
    backgroundColor: "#F59E0B20",
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelBtnText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  upgradeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  upgradeBtnText: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },
});
