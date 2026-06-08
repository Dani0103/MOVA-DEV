import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useThemeContext } from "../../context/ThemeContext";

// Diccionario de manuales. Las llaves deben coincidir con lo que devuelve 'formatTitle'
const MANUAL_CONTENT = {
  // ── Inicio ──────────────────────────────────────────────────────────────
  Home: "Aquí ves un resumen rápido de tus finanzas: saldo total, ingresos, gastos del mes y tus últimos movimientos. Usa el botón ⚡ para registrar un movimiento rápidamente.",

  // ── Cuentas ─────────────────────────────────────────────────────────────
  Cuentas:
    "Aquí están todas tus cuentas (Efectivo, Banco, Ahorros, etc.). Debes tener al menos una para registrar movimientos. Toca una cuenta para ver su detalle y movimientos.",
  "Crear Cuenta":
    "Agrega una nueva cuenta. Elige el tipo (Banco, Efectivo, etc.), asígnale un nombre, moneda y color para identificarla fácilmente.",
  "Detalle Cuenta":
    "Ve el saldo actual y el historial de movimientos de esta cuenta. Puedes editarla o archivarla si ya no la usas activamente.",

  // ── Categorías ──────────────────────────────────────────────────────────
  Categorias:
    "Las categorías te ayudan a clasificar en qué gastas o cómo ganas tu dinero. Crea categorías personalizadas con nombre, tipo (gasto/ingreso) y color.",
  "Crear Categoria":
    "Crea una nueva categoría. Asígnale un nombre descriptivo, selecciona si es de gasto o ingreso, y elige un color e ícono para reconocerla rápidamente.",
  "Detalle Categoria":
    "Ve todos los movimientos asociados a esta categoría. Puedes editar su nombre, color o ícono en cualquier momento.",

  // ── Movimientos ─────────────────────────────────────────────────────────
  Movimientos:
    "Registra toda tu actividad financiera: Gastos (dinero que sale), Ingresos (dinero que entra) y Transferencias (mover dinero entre tus propias cuentas). Usa los filtros para buscar movimientos específicos.",
  "Crear Movimiento":
    "Completa el formulario para registrar un nuevo movimiento. Selecciona el tipo, ingresa el monto, elige la categoría y la cuenta correspondiente.",
  "Detalle Movimiento":
    "Ve la información completa de este movimiento: monto, categoría, cuenta, fecha y descripción. Puedes editarlo o eliminarlo si fue un error.",

  // ── Presupuestos ────────────────────────────────────────────────────────
  Presupuestos:
    "Define cuánto puedes gastar por categoría en un periodo de tiempo. A medida que registras gastos verás cuánto del presupuesto has consumido y cuánto te queda.",
  "Crear Presupuesto":
    "Crea un nuevo presupuesto. Selecciona la categoría, define el monto límite y el periodo (semanal, mensual, etc.) que quieres controlar.",

  // ── Recurrentes ─────────────────────────────────────────────────────────
  Recurrentes:
    "Automatiza movimientos que se repiten periódicamente: salario, suscripciones, pagos de servicios, etc. El sistema los registrará automáticamente según la frecuencia configurada.",
  "Crear Recurrente":
    "Configura un movimiento automático. Define el monto, tipo, categoría, cuenta y con qué frecuencia se debe repetir (diario, semanal, mensual).",

  // ── Metas ───────────────────────────────────────────────────────────────
  Metas:
    "Define objetivos de ahorro (vacaciones, fondo de emergencia, equipo nuevo, etc.) y asigna dinero hacia ellos de forma progresiva. Función exclusiva del plan Premium.",
  "Crear Meta":
    "Crea un nuevo objetivo de ahorro. Ponle un nombre, define el monto total que quieres alcanzar y establece una fecha límite opcional.",
  "Editar Meta":
    "Modifica los datos de tu meta: nombre, monto objetivo o fecha límite.",
  "Detalle Meta":
    "Ve el progreso de tu meta: cuánto llevas ahorrado, cuánto te falta y el historial de aportes realizados.",
  "Añadir Ahorro":
    "Registra un aporte hacia esta meta. Selecciona la cuenta de donde sale el dinero e ingresa el monto que deseas destinar.",
  "Historial Aportes":
    "Revisa todos los aportes realizados a esta meta a lo largo del tiempo, con fecha y monto de cada uno.",

  // ── Deudas ──────────────────────────────────────────────────────────────
  Deudas:
    "Lleva el control de deudas que tienes pendientes (debes dinero) o que otros tienen contigo (te deben). Registra abonos y mantén el historial de pagos. Función exclusiva del plan Premium.",
  "Crear Deuda":
    "Registra una nueva deuda. Indica si tú debes o te deben, el monto total, la persona involucrada y la fecha límite de pago.",
  "Editar Deuda":
    "Modifica los datos de esta deuda: monto, persona responsable, fecha límite o descripción.",
  "Detalle Deuda":
    "Ve el estado actual de la deuda: monto original, total pagado hasta ahora y saldo pendiente.",
  "Añadir Pago Deuda":
    "Registra un abono a esta deuda. Indica el monto del pago y la fecha en que se realizó.",
  "Historial Pagos Deuda":
    "Revisa todos los pagos que se han realizado a esta deuda, con fecha y monto de cada abono.",

  // ── Estadísticas ────────────────────────────────────────────────────────
  "Estadísticas":
    "Analiza tu comportamiento financiero con gráficos detallados: distribución de gastos por categoría, evolución mensual de ingresos y gastos, y comparativas de periodos. Función exclusiva del plan Premium.",

  // ── Perfil ──────────────────────────────────────────────────────────────
  Perfil:
    "Administra tu información personal: nombre, correo y contraseña. Aquí también puedes ver tu plan actual, cambiar el tema visual de la app (claro/oscuro) y cerrar sesión.",

  // ── Admin ───────────────────────────────────────────────────────────────
  Admin:
    "Panel de administración del sistema. Solo accesible para administradores. Aquí puedes gestionar usuarios, planes y configuraciones globales de la plataforma.",

  // ── Planes ──────────────────────────────────────────────────────────────
  Planes:
    "Conoce los planes disponibles de MOVA. El plan Premium desbloquea funciones avanzadas como Metas de ahorro, control de Deudas y Estadísticas detalladas.",
};

export default function Header() {
  const theme = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
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
    if (name === "CategoriasHome") return "Categorias";
    if (name === "MovimientosHome") return "Movimientos";
    if (name === "DeudasHome") return "Deudas";

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

        {/* Acciones Derecha (Tema + Ayuda + Salir) */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.iconBtn}
            accessibilityLabel={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={24}
              color={isDark ? "#F59E0B" : theme.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.iconBtn}
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
    justifyContent: "flex-end",
    gap: 8,
  },
  iconBtn: {
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
