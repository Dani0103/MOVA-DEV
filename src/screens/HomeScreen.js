import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/layout/Header";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>$ 3.250.000</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ingresos</Text>
            <Text style={styles.income}>+$ 4.000.000</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Gastos</Text>
            <Text style={styles.expense}>-$ 750.000</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>+ Gasto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>+ Ingreso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 50,
  },

  content: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
  },

  balanceCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },

  balanceAmount: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 14,
  },

  summaryTitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
  },

  income: {
    color: "#4ADE80",
    fontSize: 16,
    fontWeight: "600",
  },

  expense: {
    color: "#F87171",
    fontSize: 16,
    fontWeight: "600",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  actionText: {
    color: "white",
    fontWeight: "600",
  },
});
