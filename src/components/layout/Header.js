import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Diccionario de manuales. Las llaves deben coincidir con lo que devuelve 'formatTitle'
const MANUAL_CONTENT = {
  Home: "Aquí verás un resumen rápido de tu dinero. Comienza revisando tus saldos totales.",
  Cuentas:
    "Crea cuentas (Efectivo, Banco, etc.). Debes tener al menos una para registrar movimientos.",
  Categorias:
    "Crea carpetas/etiquetas para clasificar en qué gastas o cómo ganas tu dinero.",
  Movimientos:
    "Aquí registras tu actividad: Ingresos (dinero que entra), Gastos (dinero que sale) y Transferencias (pasar dinero de una cuenta tuya a otra).",
  Metas:
    "Define objetivos de ahorro a corto o largo plazo y asigna dinero a ellos.",
  Deudas: "Registra dinero que debes o que te deben para no perder el rastro.",
  Estadísticas: "Revisa gráficos detallados de tu comportamiento financiero.",
  Perfil: "Administra tu información personal y ajustes de la cuenta.",
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const routeName = useNavigationState((state) => {
    if (!state) return "Home"; // Por seguridad inicial
    const route = state.routes[state.index];

    // Si es stack anidado (como CuentasStack)
    if (route.state) {
      const nestedRoute = route.state.routes[route.state.index];
      return nestedRoute.name;
    }

    return route.name;
  });

  const isHome = routeName === "Home";

  const formatTitle = (name) => {
    if (name === "CuentasHome") return "Cuentas";
    if (name === "CategoriasHome") return "Categorias"; // Por si tienes algo similar
    if (name === "MovimientosHome") return "Movimientos";

    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const currentTitle = isHome ? "Home" : formatTitle(routeName);
  const helpText =
    MANUAL_CONTENT[currentTitle] ||
    "Aquí puedes gestionar esta sección y mantener tus finanzas al día.";

  return (
    <>
      <View style={styles.header}>
        {/* Botón menú */}
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.leftBtn}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>

        {/* Contenido dinámico */}
        {isHome ? (
          <View style={styles.centerContent}>
            <Text style={styles.welcome}>Hola</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.nombre} {user?.apellido}
            </Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.title}>{currentTitle}</Text>
          </View>
        )}

        {/* Acciones Derecha (Ayuda + Salir) */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.helpBtn}
          >
            <Ionicons name="help-circle-outline" size={26} color="#38BDF8" />
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DE MANUAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={30} color="#38BDF8" />
              <Text style={styles.modalTitle}>Ayuda: {currentTitle}</Text>
            </View>

            <Text style={styles.modalText}>{helpText}</Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  leftBtn: {
    width: 40, // Fija el ancho para mantener el centro centrado
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
  },
  welcome: {
    color: "#94A3B8",
    fontSize: 12,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Nuevo contenedor para la derecha
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 70, // Fija el ancho para balancear con el leftBtn
    justifyContent: "flex-end",
    gap: 10,
  },
  helpBtn: {
    padding: 2,
  },
  logoutBtn: {
    backgroundColor: "#1E293B",
    padding: 6,
    borderRadius: 20,
  },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  modalTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  modalText: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  closeBtn: {
    backgroundColor: "#38BDF8",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#0F172A", fontWeight: "bold", fontSize: 16 },
});
