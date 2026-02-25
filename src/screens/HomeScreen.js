import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  // Datos mock (luego los conectamos al backend)
  const ingresos = 4000000;
  const gastos = 2750000;
  const ahorro = ingresos - gastos;
  const saldoDisponible = 8250000;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Saldo disponible */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>
            $ {saldoDisponible.toLocaleString()}
          </Text>
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryRow}>
          <View style={styles.incomeCard}>
            <Text style={styles.cardTitle}>Ingresos</Text>
            <Text style={styles.income}>+$ {ingresos.toLocaleString()}</Text>
          </View>

          <View style={styles.expenseCard}>
            <Text style={styles.cardTitle}>Gastos</Text>
            <Text style={styles.expense}>-$ {gastos.toLocaleString()}</Text>
          </View>
        </View>

        {/* Ahorro del mes */}
        <View style={styles.savingsCard}>
          <Text style={styles.cardTitle}>Ahorro del Mes</Text>
          <Text
            style={[
              styles.savingsAmount,
              { color: ahorro >= 0 ? "#4ADE80" : "#F87171" },
            ]}
          >
            $ {ahorro.toLocaleString()}
          </Text>
        </View>

        {/* Últimos movimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Movimientos</Text>

          <View style={styles.transaction}>
            <Text style={styles.transactionText}>Arriendo</Text>
            <Text style={styles.expense}>- $ 1.200.000</Text>
          </View>

          <View style={styles.transaction}>
            <Text style={styles.transactionText}>Salario</Text>
            <Text style={styles.income}>+ $ 3.000.000</Text>
          </View>

          <View style={styles.transaction}>
            <Text style={styles.transactionText}>Mercado</Text>
            <Text style={styles.expense}>- $ 320.000</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    color: "#94A3B8",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#38BDF8",
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  incomeCard: {
    backgroundColor: "#064E3B",
    padding: 15,
    borderRadius: 12,
    width: "48%",
  },
  expenseCard: {
    backgroundColor: "#7F1D1D",
    padding: 15,
    borderRadius: 12,
    width: "48%",
  },
  cardTitle: {
    color: "white",
  },
  income: {
    color: "#4ADE80",
    fontWeight: "bold",
    marginTop: 5,
  },
  expense: {
    color: "#F87171",
    fontWeight: "bold",
    marginTop: 5,
  },
  section: {
    marginTop: 10,
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
  savingsCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  savingsAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
});
