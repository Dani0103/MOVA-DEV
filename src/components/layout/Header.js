import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

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
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const routeName = useNavigationState((state) => {
    if (!state) return "Home";

    const route = state.routes[state.index];
    if (!route) return "Home";

    // Si es stack anidado (como CuentasStack), el estado interno puede estar
    // parcialmente inicializado durante el linking — verificamos antes de acceder
    if (route.state) {
      const nestedIndex = route.state.index;
      const nestedRoute =
        nestedIndex != null ? route.state.routes[nestedIndex] : null;
      if (nestedRoute?.name) return nestedRoute.name;
    }

    return route.name ?? "Home";
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
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.card }]}>
        {/* Botón menú */}
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.leftBtn}
        >
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Contenido dinámico */}
        {isHome ? (
          <View style={styles.centerContent}>
            <Text style={[styles.welcome, { color: theme.textSecondary }]}>Hola</Text>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {user?.nombre} {user?.apellido}
            </Text>
            <View style={[
              styles.planBadge,
              { backgroundColor: user?.plan?.id === 1 ? theme.cardSecondary : "#F59E0B20" }
            ]}>
              {user?.plan?.id !== 1 && (
                <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />
              )}
              <Text style={[
                styles.planBadgeText,
                { color: user?.plan?.id === 1 ? theme.textMuted : "#F59E0B" }
              ]}>
                {user?.plan?.nombre ?? "Free"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Text style={[styles.title, { color: theme.text }]}>{currentTitle}</Text>
          </View>
        )}

        {/* Acciones Derecha (Ayuda + Salir) */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.helpBtn}
          >
            <Ionicons name="help-circle-outline" size={26} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: theme.card }]}>
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
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="information-circle" size={30} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ayuda: {currentTitle}</Text>
            </View>

            <Text style={[styles.modalText, { color: theme.textSecondary }]}>{helpText}</Text>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: theme.background }]}>Entendido</Text>
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
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 15,
    borderBottomWidth: 1,
  },
  leftBtn: {
    width: 40, // Fija el ancho para mantener el centro centrado
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
  },
  welcome: {
    fontSize: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 4,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
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
    padding: 6,
    borderRadius: 20,
  },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    width: "100%",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  closeBtn: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { fontWeight: "bold", fontSize: 16 },
});
