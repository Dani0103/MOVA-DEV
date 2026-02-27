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

export default function DetalleDeudaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibimos la deuda por parámetros (o usamos un mock)
  const { deuda } = route.params || {
    deuda: {
      id: 1,
      acreedor: "Banco X (Tarjeta)",
      monto_total: 2000000,
      abonado: 500000,
      color: "#F87171",
      icono: "card",
    },
  };

  const saldoPendiente = deuda.monto_total - deuda.abonado;
  const progreso = (deuda.abonado / deuda.monto_total) * 100;

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
        <Text style={styles.headerTitle}>Detalle de Deuda</Text>
        {/* <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="trash-outline" size={20} color="#F87171" />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Principal */}
        <View style={styles.mainInfoCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: deuda.color + "20" },
            ]}
          >
            <Ionicons name={deuda.icono} size={50} color={deuda.color} />
          </View>
          <Text style={styles.acreedorTitle}>{deuda.acreedor}</Text>
          <Text style={styles.totalSubtitle}>
            Deuda Inicial: $ {deuda.monto_total.toLocaleString()}
          </Text>
        </View>

        {/* Resumen de Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Pendiente</Text>
          <Text style={styles.balanceAmount}>
            $ {saldoPendiente.toLocaleString()}
          </Text>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progreso, 100)}%`,
                  backgroundColor: deuda.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progreso.toFixed(1)}% pagado</Text>
        </View>

        {/* Estadísticas en Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Abonado</Text>
            <Text style={[styles.statValue, { color: "#4ADE80" }]}>
              $ {deuda.abonado.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Tasa Interés</Text>
            <Text style={styles.statValue}>N/A</Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: deuda.color }]}
            onPress={() => navigation.navigate("AñadirPagoDeuda", { deuda })}
          >
            <Ionicons name="wallet-outline" size={22} color="white" />
            <Text style={styles.primaryActionText}>Registrar Pago</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>
              Ver historial de pagos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerta de Pago */}
        <View style={styles.warningCard}>
          <Ionicons name="alert-circle-outline" size={20} color="#FB923C" />
          <Text style={styles.warningText}>
            Recuerda realizar tus pagos a tiempo para evitar intereses por mora.
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
    paddingTop: 10,
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
  acreedorTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  totalSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  balanceLabel: {
    color: "#94A3B8",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#F87171",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 10,
    fontWeight: "600",
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
    fontSize: 11,
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
    gap: 10,
  },
  primaryActionText: {
    color: "white",
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
  warningCard: {
    flexDirection: "row",
    backgroundColor: "rgba(251, 146, 60, 0.1)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(251, 146, 60, 0.2)",
  },
  warningText: {
    color: "#94A3B8",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
