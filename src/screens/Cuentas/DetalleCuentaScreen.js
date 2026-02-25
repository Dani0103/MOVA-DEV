import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function DetalleCuentaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cuenta } = route.params;

  const movimientos = [
    { id: 1, descripcion: "Salario", tipo: "ingreso", monto: 3000000 },
    { id: 2, descripcion: "Mercado", tipo: "gasto", monto: 320000 },
    { id: 3, descripcion: "Netflix", tipo: "gasto", monto: 45000 },
  ];

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, m) => acc + m.monto, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* TopBar (Volver + Título) */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle} numberOfLines={1}>
            Detalle de cuenta
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal */}
        <View style={styles.balanceCard}>
          <Text style={styles.accountName} numberOfLines={1}>
            {cuenta.nombre}
          </Text>
          <Text style={styles.accountType}>{cuenta.tipo}</Text>

          <Text style={styles.balanceLabel}>Saldo Actual</Text>
          <Text style={styles.balance}>$ {cuenta.saldo.toLocaleString()}</Text>
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryRow}>
          <View style={styles.incomeCard}>
            <Text style={styles.summaryTitle}>Ingresos</Text>
            <Text style={styles.income}>+$ {ingresos.toLocaleString()}</Text>
          </View>

          <View style={styles.expenseCard}>
            <Text style={styles.summaryTitle}>Gastos</Text>
            <Text style={styles.expense}>-$ {gastos.toLocaleString()}</Text>
          </View>
        </View>

        {/* Movimientos */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },

  backText: {
    color: "white",
    fontWeight: "600",
  },

  topTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  balanceCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  accountName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  accountType: {
    color: "#94A3B8",
    marginBottom: 10,
  },

  balanceLabel: {
    color: "#94A3B8",
    marginTop: 10,
  },

  balance: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#38BDF8",
    marginTop: 5,
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

  summaryTitle: {
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
});
