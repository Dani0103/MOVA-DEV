import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function DetalleMetaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibimos la meta por parámetros (si no viene, usamos un mock para desarrollo)
  const { meta } = route.params || {
    meta: {
      id: 1,
      nombre: "Fondo de Emergencia",
      objetivo: 5000000,
      actual: 2850000,
      color: "#38BDF8",
      icono: "shield-checkmark",
      fecha_limite: "2026-12-31",
    },
  };

  const progreso = (meta.actual / meta.objetivo) * 100;
  const faltante = meta.objetivo - meta.actual;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progreso de Meta</Text>
        {/* <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="options-outline" size={20} color="#38BDF8" />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Principal */}
        <View style={styles.mainInfoCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: meta.color + "20" },
            ]}
          >
            <Ionicons name={meta.icono} size={50} color={meta.color} />
          </View>
          <Text style={styles.metaTitle}>{meta.nombre}</Text>
          <Text style={styles.metaSubtitle}>
            Objetivo: $ {meta.objetivo.toLocaleString()}
          </Text>
        </View>

        {/* Visual de Progreso Circular o Barra Grande */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progreso, 100)}%`,
                  backgroundColor: meta.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.percentageText}>{progreso.toFixed(1)}%</Text>
            <Text style={styles.remainingText}>
              Faltan $ {faltante.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Resumen de Datos */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Ahorrado</Text>
            <Text style={[styles.statValue, { color: meta.color }]}>
              $ {meta.actual.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fecha Meta</Text>
            <Text style={styles.statValue}>
              {meta.fecha_limite || "Sin fecha"}
            </Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: meta.color }]}
          >
            <Ionicons name="add-circle" size={22} color="#0F172A" />
            <Text style={styles.primaryActionText}>Añadir Ahorro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Historial de aportes</Text>
          </TouchableOpacity>
        </View>

        {/* Tips automáticos */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#FACC15" />
          <Text style={styles.tipText}>
            Si ahorras{" "}
            <Text style={{ fontWeight: "bold", color: "white" }}>
              $ 250,000
            </Text>{" "}
            cada mes, alcanzarás tu meta en 9 meses.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  editBtn: {
    padding: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  mainInfoCard: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  metaTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  metaSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 5,
  },
  progressSection: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#334155",
    borderRadius: 6,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  percentageText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  remainingText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 16,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  statValue: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  actionSection: {
    gap: 12,
    marginBottom: 20,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  primaryActionText: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryAction: {
    alignItems: "center",
    padding: 15,
  },
  secondaryActionText: {
    color: "#38BDF8",
    fontWeight: "600",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
  },
  tipText: {
    color: "#94A3B8",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
