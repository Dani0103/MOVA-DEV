import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { useTheme } from "../theme/useTheme";
import FloatingMenuButton from "../components/layout/FloatingMenuButton";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Paises, updateProfile, logoutAll } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { universalAlert } from "../utils/universalAlert";

export default function InfoPersonal() {
  const { user, token, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeContext();
  const theme = useTheme();

  const [nombrePais, setNombrePais] = useState(null);

  // Edit profile modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setEditNombre(user.nombre ?? "");
    setEditApellido(user.apellido ?? "");
    setEditVisible(true);
  };

  const handleGuardarPerfil = async () => {
    if (!editNombre.trim()) {
      universalAlert("Error", "El nombre no puede estar vacío.");
      return;
    }
    try {
      setSaving(true);
      await updateProfile(token, {
        nombre: editNombre.trim(),
        apellido: editApellido.trim() || undefined,
      });
      // Actualizar contexto directamente con los valores del formulario
      await updateUser({
        nombre: editNombre.trim(),
        apellido: editApellido.trim(),
      });
      // Cerrar modal primero para que el cambio sea visible de inmediato
      setEditVisible(false);
      universalAlert("¡Perfil actualizado!", "Tus datos se guardaron correctamente.");
    } catch (e) {
      universalAlert("Error", e.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = () => {
    universalAlert(
      "¿Cerrar sesión en todos los dispositivos?",
      "Se cerrarán todas las sesiones activas, incluida esta. Tendrás que volver a iniciar sesión.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar todas",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutAll(token);
              universalAlert(
                "Sesiones cerradas",
                "Todas las sesiones fueron revocadas. Iniciando sesión de nuevo...",
                [{ text: "OK", onPress: () => logout() }]
              );
            } catch (e) {
              // Si el token ya esta revocado, igualmente forzamos logout local
              await logout();
            }
          },
        },
      ]
    );
  };

  const reiniciarTutorial = async () => {
    try {
      await AsyncStorage.removeItem("ya_vio_tutorial");
      universalAlert(
        "Tutorial Reiniciado",
        "La próxima vez que abras la aplicación verás de nuevo la bienvenida.",
        [{ text: "Entendido" }],
      );
    } catch (error) {
      console.error("Error al limpiar el tutorial:", error);
    }
  };

  if (!user) return null;

  useEffect(() => {
    const obtenerNombrePais = async () => {
      if (!user?.nacionalidad) {
        setNombrePais("No especificada");
        return;
      }
      try {
        const response = await Paises();
        const paisEncontrado = response?.data?.find(
          (p) => p.codigo_iso2.toUpperCase() === user.nacionalidad.toUpperCase(),
        );
        setNombrePais(paisEncontrado ? paisEncontrado.nombre : user.nacionalidad ?? "No especificada");
      } catch {
        setNombrePais(user.nacionalidad ?? "No especificada");
      }
    };
    obtenerNombrePais();
  }, [user?.nacionalidad]);

  const initials = `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.cardSecondary, borderColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.text }]}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {user.nombre} {user.apellido}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user.activo ? "Cuenta Activa" : "Inactiva"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: theme.primary + "18", borderColor: theme.primary + "40" }]}
            onPress={openEdit}
            activeOpacity={0.75}
          >
            <Ionicons name="pencil-outline" size={14} color={theme.primary} />
            <Text style={[styles.editProfileText, { color: theme.primary }]}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Detalles */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Detalles de la cuenta
        </Text>
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="flag-outline" size={20} color={theme.primary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nacionalidad</Text>
            {nombrePais === null
              ? <View style={{ height: 20, width: 90, backgroundColor: theme.cardSecondary, borderRadius: 6, marginTop: 4 }} />
              : <Text style={[styles.value, { color: theme.text }]}>{nombrePais}</Text>
            }
          </View>
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cash-outline" size={20} color={theme.primary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Moneda Principal</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.moneda}</Text>
          </View>
        </View>

        {/* Apariencia */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Apariencia
        </Text>
        <View style={[styles.devCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.devIconCircle, { backgroundColor: theme.primary + "20" }]}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={theme.primary}
            />
          </View>
          <View style={styles.devTextContainer}>
            <Text style={[styles.devTitle, { color: theme.text }]}>
              {isDark ? "Modo Oscuro" : "Modo Claro"}
            </Text>
            <Text style={[styles.devSubtitle, { color: theme.textMuted }]}>
              Cambia la apariencia de la app
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#CBD5E1", true: theme.primary + "60" }}
            thumbColor={isDark ? theme.primary : "#94A3B8"}
          />
        </View>

        {/* Ayuda */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Ayuda y Soporte
        </Text>
        <TouchableOpacity
          style={[styles.devCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={reiniciarTutorial}
          activeOpacity={0.7}
        >
          <View style={[styles.devIconCircle, { backgroundColor: theme.error + "20" }]}>
            <Ionicons name="help-buoy-outline" size={22} color={theme.error} />
          </View>
          <View style={styles.devTextContainer}>
            <Text style={[styles.devTitle, { color: theme.text }]}>
              Ver Tutorial de Bienvenida
            </Text>
            <Text style={[styles.devSubtitle, { color: theme.textMuted }]}>
              Reinicia el tour guiado de la aplicación
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Seguridad */}
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Seguridad
        </Text>
        <TouchableOpacity
          style={[styles.devCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handleLogoutAll}
          activeOpacity={0.7}
        >
          <View style={[styles.devIconCircle, { backgroundColor: "#F8717120" }]}>
            <Ionicons name="log-out-outline" size={22} color="#F87171" />
          </View>
          <View style={styles.devTextContainer}>
            <Text style={[styles.devTitle, { color: theme.text }]}>
              Cerrar sesión en todos los dispositivos
            </Text>
            <Text style={[styles.devSubtitle, { color: theme.textMuted }]}>
              Revoca todas las sesiones activas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Footer */}
        <View style={[styles.footerCard, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.footerLabel, { color: theme.textSecondary }]}>
              Último acceso:
            </Text>
            <Text style={[styles.footerValue, { color: theme.text }]}>
              {formatDate(user.ultimo_login)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Nombre</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Tu nombre"
              placeholderTextColor={theme.textMuted}
              value={editNombre}
              onChangeText={setEditNombre}
            />

            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Apellido</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
              placeholder="Tu apellido"
              placeholderTextColor={theme.textMuted}
              value={editApellido}
              onChangeText={setEditApellido}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
              onPress={handleGuardarPerfil}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="white" />
                : <Text style={styles.modalSaveBtnText}>Guardar Cambios</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerCard: {
    borderRadius: 24,
    padding: 30,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
  },
  avatarText: { fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  email: { fontSize: 14, textAlign: "center", marginTop: 4 },
  badge: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 15,
  },
  badgeText: { color: "#4ADE80", fontSize: 12, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 30,
    marginBottom: 15,
    marginLeft: 5,
  },
  infoGrid: { flexDirection: "row", gap: 15 },
  infoCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  label: { fontSize: 11, fontWeight: "600", marginTop: 10, textTransform: "uppercase" },
  value: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  devCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    gap: 15,
    marginBottom: 12,
  },
  devIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  devTextContainer: { flex: 1 },
  devTitle: { fontSize: 15, fontWeight: "bold" },
  devSubtitle: { fontSize: 12, marginTop: 2 },
  footerCard: { borderRadius: 20, padding: 15, marginTop: 8, marginBottom: 100 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerLabel: { fontSize: 13 },
  footerValue: { fontSize: 13, fontWeight: "600" },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: { fontSize: 13, fontWeight: "600" },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    padding: 14,
    borderRadius: 14,
    fontSize: 15,
  },
  modalSaveBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 28,
  },
  modalSaveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
