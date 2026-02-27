import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function EstadisticasScreen() {
  const [periodo, setPeriodo] = useState("Mes");

  // Mock de datos para los gráficos
  const dataPie = [
    {
      name: "Comida",
      population: 35,
      color: "#F87171",
      legendFontColor: "#94A3B8",
    },
    {
      name: "Vivienda",
      population: 40,
      color: "#38BDF8",
      legendFontColor: "#94A3B8",
    },
    {
      name: "Transporte",
      population: 15,
      color: "#FACC15",
      legendFontColor: "#94A3B8",
    },
    {
      name: "Ocio",
      population: 10,
      color: "#A78BFA",
      legendFontColor: "#94A3B8",
    },
  ];

  const dataBar = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    datasets: [{ data: [400, 600, 300, 800] }],
  };

  const chartWidth = screenWidth - 80;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Estadísticas</Text>
        <View style={styles.tabBar}>
          {["Semana", "Mes", "Año"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriodo(p)}
              style={[styles.tab, periodo === p && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, periodo === p && styles.tabTextActive]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tarjetas de Resumen Rápido */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="trending-up" size={20} color="#4ADE80" />
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={styles.incomeAmount}>$ 4.500.000</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="trending-down" size={20} color="#F87171" />
          <Text style={styles.summaryLabel}>Gastos</Text>
          <Text style={styles.expenseAmount}>$ 2.850.000</Text>
        </View>
      </View>

      {/* Gráfico de Gastos por Categoría */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Gastos por Categoría</Text>
        <PieChart
          data={dataPie}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 0]}
          absolute
        />
      </View>

      {/* Gráfico de Barras de Actividad */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Flujo de Efectivo</Text>
        <BarChart
          data={dataBar}
          width={chartWidth}
          height={220}
          yAxisLabel="$"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          style={styles.barChartStyle}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#1E293B",
  backgroundGradientTo: "#1E293B",
  color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`, // #38BDF8
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForLabels: {
    fontSize: 10, // Etiquetas más pequeñas para evitar desbordes
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  header: { marginTop: 40, marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "bold", color: "white", marginBottom: 15 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#334155" },
  tabText: { color: "#64748B", fontWeight: "600" },
  tabTextActive: { color: "#38BDF8" },
  summaryRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  summaryLabel: { color: "#94A3B8", fontSize: 12, marginVertical: 5 },
  incomeAmount: { color: "#4ADE80", fontSize: 16, fontWeight: "bold" },
  expenseAmount: { color: "#F87171", fontSize: 16, fontWeight: "bold" },
  chartSection: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  chartTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  barChartStyle: { borderRadius: 16, marginVertical: 8 },
});
