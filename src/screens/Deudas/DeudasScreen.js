import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DEUDAS_MOCK = [
  {
    id: 1,
    acreedor: "Banco X (Tarjeta)",
    monto_total: 2000000,
    abonado: 500000,
    color: "#F87171",
    icono: "card",
  },
  {
    id: 2,
    acreedor: "Préstamo Juan",
    monto_total: 150000,
    abonado: 150000,
    color: "#4ADE80",
    icono: "person",
  },
  {
    id: 3,
    acreedor: "Laptop (Cuotas)",
    monto_total: 3500000,
    abonado: 2100000,
    color: "#FB923C",
    icono: "laptop",
  },
];

export default function DeudasScreen() {
  const navigation = useNavigation();

  const totalDeuda = DEUDAS_MOCK.reduce(
    (acc, d) => acc + (d.monto_total - d.abonado),
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Mis Deudas</Text>
          <Text style={styles.totalLabel}>
            Total pendiente: $ {totalDeuda.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CrearDeuda")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {DEUDAS_MOCK.map((deuda) => {
          const saldoPendiente = deuda.monto_total - deuda.abonado;
          const progreso = (deuda.abonado / deuda.monto_total) * 100;
          const isPagada = saldoPendiente <= 0;

          return (
            <TouchableOpacity
              key={deuda.id}
              style={styles.deudaCard}
              onPress={() => navigation.navigate("DetalleDeuda", { deuda })}
            >
              <View style={styles.deudaHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: deuda.color + "20" },
                  ]}
                >
                  <Ionicons name={deuda.icono} size={22} color={deuda.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.acreedorName}>{deuda.acreedor}</Text>
                  <Text style={styles.pendientText}>
                    {isPagada
                      ? "¡Pagada!"
                      : `Faltan $ ${saldoPendiente.toLocaleString()}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#334155" />
              </View>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progreso, 100)}%`,
                      backgroundColor: isPagada ? "#4ADE80" : deuda.color,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  totalLabel: {
    color: "#F87171",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#38BDF8",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deudaCard: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
  },
  deudaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  acreedorName: { color: "white", fontSize: 16, fontWeight: "bold" },
  pendientText: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  progressBg: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
});
