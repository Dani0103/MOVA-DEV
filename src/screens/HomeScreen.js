import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    saldoDisponible: 0,
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
    movimientos: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulamos una respuesta que podría venir incompleta
        const mockResponse = {
          // saldoDisponible: 8250000,
          // ingresos: 4000000,
          // gastos: 2750000,
          // movimientos: [
          //   { id: "1", titulo: "Arriendo", monto: -1200000, tipo: "gasto" },
          //   { id: "2", titulo: "Salario", monto: 3000000, tipo: "ingreso" },
          // ],
        };

        setData({
          saldoDisponible: mockResponse?.saldoDisponible ?? 0,
          ingresos: mockResponse?.ingresos ?? 0,
          gastos: mockResponse?.gastos ?? 0,
          movimientos: Array.isArray(mockResponse?.movimientos)
            ? mockResponse.movimientos
            : [],
          ahorro: (mockResponse?.ingresos ?? 0) - (mockResponse?.gastos ?? 0),
        });
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Saldo con validación de número */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>
            $ {(data.saldoDisponible || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.incomeCard}>
            <Text style={styles.cardTitle}>Ingresos</Text>
            <Text style={styles.income}>
              +$ {(data.ingresos || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.expenseCard}>
            <Text style={styles.cardTitle}>Gastos</Text>
            <Text style={styles.expense}>
              -$ {(data.gastos || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.savingsCard}>
          <Text style={styles.cardTitle}>Ahorro del Mes</Text>
          <Text
            style={[
              styles.savingsAmount,
              { color: (data.ahorro || 0) >= 0 ? "#4ADE80" : "#F87171" },
            ]}
          >
            $ {(data.ahorro || 0).toLocaleString()}
          </Text>
        </View>

        {/* Sección de movimientos con validación de lista vacía */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Movimientos</Text>

          {data.movimientos.length > 0 ? (
            data.movimientos.map((item) => (
              <View key={item.id} style={styles.transaction}>
                <Text style={styles.transactionText}>
                  {item.titulo || "Sin título"}
                </Text>
                <Text
                  style={
                    item.tipo === "ingreso" ? styles.income : styles.expense
                  }
                >
                  {item.tipo === "ingreso" ? "+" : "-"} $
                  {Math.abs(item.monto || 0).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{ color: "#94A3B8", textAlign: "center", marginTop: 20 }}
            >
              No hay movimientos registrados
            </Text>
          )}
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
