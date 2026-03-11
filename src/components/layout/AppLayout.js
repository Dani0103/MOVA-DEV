import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Asegúrate de tenerlo importado para los iconos del modal

import Header from "./Header";
import HomeScreen from "../../screens/HomeScreen";
import InfoPersonal from "../../screens/InfoPersonal";
import CuentasStack from "../../navigation/CuentasStack";
import MovimientosStack from "../../navigation/MovimientosStack";
import CategoriasStack from "../../navigation/CategoriasStack";
import MetasStack from "../../navigation/MetasStack";
import DeudasStack from "../../navigation/DeudasStack";
import EstadisticasScreen from "../../screens/EstadisticasScreen";
import PlanesScreen from "../../screens/PlanesScreen"; // <-- IMPORTANTE: Tu nueva pantalla importada
import { useAuth } from "../../context/AuthContext";

const Drawer = createDrawerNavigator();

export default function AppLayout() {
  const { user } = useAuth();
  const navigation = useNavigation();

  // Estado para controlar el modal del paywall
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [attemptedSection, setAttemptedSection] = useState("");

  const isFreePlan = user?.plan?.id === 1;

  // Interceptor genérico para secciones de pago
  const handlePremiumPress = (e, sectionName) => {
    if (isFreePlan) {
      e.preventDefault(); // Bloquea la navegación
      setAttemptedSection(sectionName); // Guardamos qué intentó abrir para el mensaje
      setShowPremiumModal(true); // Mostramos el modal
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          header: () => <Header />,
          drawerStyle: { backgroundColor: "#0F172A", width: 240 },
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
        <Drawer.Screen name="Categorias" component={CategoriasStack} />
        <Drawer.Screen name="Movimientos" component={MovimientosStack} />

        {/* --- SECCIONES BLOQUEADAS --- */}
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
          listeners={{
            drawerItemPress: (e) => handlePremiumPress(e, "Deudas"),
          }}
          options={{
            title: isFreePlan ? "Deudas 🔒" : "Deudas",
            drawerItemStyle: isFreePlan ? { opacity: 0.5 } : {},
          }}
        />
        <Drawer.Screen
          name="Estadísticas"
          component={EstadisticasScreen}
          listeners={{
            drawerItemPress: (e) => handlePremiumPress(e, "Estadísticas"),
          }}
          options={{
            title: isFreePlan ? "Estadísticas 🔒" : "Estadísticas",
            drawerItemStyle: isFreePlan ? { opacity: 0.5 } : {},
          }}
        />
        {/* ----------------------------- */}

        {/* --- PANTALLA DE PLANES --- */}
        <Drawer.Screen
          name="Planes"
          component={PlanesScreen}
          options={{
            title: "🌟 Planes y Precios", // Texto llamativo
            drawerLabelStyle: { color: "#F59E0B", fontWeight: "bold" }, // Estilo especial para destacarlo
            // DESCOMENTA LA LÍNEA DE ABAJO SI NO QUIERES QUE SE VEA EN EL MENÚ LATERAL:
            // drawerItemStyle: { display: 'none' }
          }}
        />
        {/* -------------------------- */}

        <Drawer.Screen
          name="Perfil"
          component={InfoPersonal}
          options={{ title: "Perfil" }}
        />
      </Drawer.Navigator>

      {/* MODAL PREMIUM (PAYWALL) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPremiumModal}
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Ícono llamativo */}
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={40} color="#F59E0B" />
            </View>

            <Text style={styles.modalTitle}>
              ¡Desbloquea {attemptedSection}!
            </Text>

            <Text style={styles.modalText}>
              Esta función es exclusiva de nuestro plan Premium. Mejora tu
              cuenta para acceder a herramientas avanzadas y tomar el control
              total de tus finanzas.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowPremiumModal(false)}
              >
                <Text style={styles.cancelBtnText}>Quizás luego</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => {
                  setShowPremiumModal(false);
                  navigation.navigate("Planes"); // <-- Navega a la nueva pantalla de Planes
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

// Estilos para el Modal Premium
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)", // Fondo oscuro semi-transparente
    justifyContent: "flex-end", // Sale desde abajo como un bottom sheet
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#334155",
  },
  iconContainer: {
    backgroundColor: "#F59E0B20", // Fondo naranja muy transparente
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    color: "#94A3B8",
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
    backgroundColor: "#0F172A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cancelBtnText: {
    color: "#94A3B8",
    fontWeight: "bold",
    fontSize: 16,
  },
  upgradeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B", // Color oro/naranja para premium
    alignItems: "center",
  },
  upgradeBtnText: {
    color: "#0F172A", // Texto oscuro para contrastar con el botón
    fontWeight: "bold",
    fontSize: 16,
  },
});
