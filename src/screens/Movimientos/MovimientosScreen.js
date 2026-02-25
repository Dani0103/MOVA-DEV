import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MovimientosScreen({ navigation, movimientos }) {
  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, m) => acc + m.monto, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Mes</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.income}>+$ {ingresos.toLocaleString()}</Text>
            <Text style={styles.expense}>-$ {gastos.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Movimientos</Text>

        {movimientos.map((mov) => (
          <View key={mov.id} style={styles.transaction}>
            <Text style={styles.transactionText}>{mov.descripcion}</Text>

            <Text
              style={mov.tipo === "ingreso" ? styles.income : styles.expense}
            >
              {mov.tipo === "ingreso" ? "+" : "-"}${mov.monto.toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CrearMovimiento")}
      >
        <Ionicons name="add" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },

  summaryCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  summaryTitle: {
    color: "white",
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  income: {
    color: "#4ADE80",
    fontWeight: "bold",
  },

  expense: {
    color: "#F87171",
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
  },

  transaction: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  transactionText: {
    color: "white",
  },

  metaText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#38BDF8",
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
