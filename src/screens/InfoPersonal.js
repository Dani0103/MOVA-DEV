import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import FloatingMenuButton from "../components/layout/FloatingMenuButton";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Paises } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔹 Importante
import { universalAlert } from "../utils/universalAlert"; // 🔹 Para el feedback

export default function InfoPersonal() {
  const { user } = useAuth();
  const [nombrePais, setNombrePais] = useState("Cargando...");

  // 🔹 Función para resetear el tutorial en AsyncStorage
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
        const paisEncontrado = response.data.find(
          (p) =>
            p.codigo_iso2.toUpperCase() === user.nacionalidad.toUpperCase(),
        );

        if (paisEncontrado) {
          setNombrePais(paisEncontrado.nombre);
        } else {
          setNombrePais(user.nacionalidad);
        }
      } catch (error) {
        console.error("Error al obtener el país:", error);
        setNombrePais(user.nacionalidad);
      }
    };

    obtenerNombrePais();
  }, [user?.nacionalidad]);

  const initials = `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sección de Encabezado / Avatar */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {user.nombre} {user.apellido}
          </Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user.activo ? "Cuenta Activa" : "Inactiva"}
            </Text>
          </View>
        </View>

        {/* Sección de Detalles */}
        <Text style={styles.sectionTitle}>Detalles de la cuenta</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="flag-outline" size={20} color="#38BDF8" />
            <Text style={styles.label}>Nacionalidad</Text>
            <Text style={styles.value}>{nombrePais}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={20} color="#38BDF8" />
            <Text style={styles.label}>Moneda Principal</Text>
            <Text style={styles.value}>{user.moneda}</Text>
          </View>
        </View>

        {/* 🔹 SECCIÓN DE CONFIGURACIÓN / TUTORIAL */}
        <Text style={styles.sectionTitle}>Ayuda y Soporte</Text>

        <TouchableOpacity
          style={styles.devCard}
          onPress={reiniciarTutorial}
          activeOpacity={0.7}
        >
          <View style={styles.devIconCircle}>
            <Ionicons name="help-buoy-outline" size={22} color="#F87171" />
          </View>
          {user.id === 1 && (
            <View style={styles.devTextContainer}>
              <Text style={styles.devTitle}>Ver Tutorial de Bienvenida</Text>
              <Text style={styles.devSubtitle}>
                Reinicia el tour guiado de la aplicación
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.footerCard}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color="#94A3B8" />
            <Text style={styles.footerLabel}>Último acceso:</Text>
            <Text style={styles.footerValue}>
              {formatDate(user.ultimo_login)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 30,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#38BDF8",
  },
  avatarText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  email: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 15,
  },
  badgeText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 30,
    marginBottom: 15,
    marginLeft: 5,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 15,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  label: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
    textTransform: "uppercase",
  },
  value: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },

  // 🔹 NUEVOS ESTILOS PARA EL BOTÓN DE TUTORIAL
  devCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 15,
  },
  devIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  devTextContainer: {
    flex: 1,
  },
  devTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  devSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },

  footerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
    marginBottom: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },
  footerValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
});
