import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { GetDashboard } from "../services/Dashboard";
import QuickMovementModal from "./Movimientos/QuickMovementModal";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "../context/CategoryContext";
import { useAccounts } from "../context/AccountContext";

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    saldoDisponible: 0,
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
    movimientos: [],
  });

  const { categorias, refreshCategories } = useCategories();
  const { cuentas, refreshAccounts } = useAccounts();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await GetDashboard(token);

      // Extraemos el objeto data dentro de la respuesta
      const apiData = response?.data;

      if (apiData) {
        setData({
          // Convertimos los strings numéricos ("3000.00") a números reales
          saldoDisponible: parseFloat(apiData.salario_disponible || 0),
          ingresos: parseFloat(apiData.ingresos || 0),
          gastos: parseFloat(apiData.gastos || 0),
          ahorro: parseFloat(apiData.ahorros || 0),
          // Mapeamos los movimientos verificando que sea un Array
          movimientos: Array.isArray(apiData.ultimos_movimientos)
            ? apiData.ultimos_movimientos
            : [],
        });
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshCategories(token, user.id);
    refreshAccounts(token);
  }, [token]);

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
            {/* <Text style={styles.seeAll}>Ver todos</Text> */}
          </View>

          {data.movimientos.length > 0 ? (
            data.movimientos.map((item) => (
              <View key={item.id} style={styles.transactionCard}>
                {/* Lado Izquierdo: Icono o Inicial con el color de la cuenta */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        item.cuenta_origen?.color_hex || "#334155",
                    },
                  ]}
                >
                  <Text style={styles.iconLetter}>
                    {item.categoria.nombre.charAt(0).toUpperCase()}
                  </Text>
                </View>

                {/* Centro: Info del movimiento */}
                <View style={styles.transactionInfo}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.categoria.nombre}
                  </Text>
                  <Text style={styles.detailsText}>
                    {item.cuenta_origen?.nombre} •{" "}
                    {new Date(item.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </Text>
                </View>

                {/* Derecha: Monto */}
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.amountText,
                      item.tipo === "ingreso"
                        ? styles.incomeText
                        : styles.expenseText,
                    ]}
                  >
                    {item.tipo === "ingreso" ? "+" : "-"} $
                    {Math.abs(parseFloat(item.monto)).toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay movimientos registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <QuickMovementModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        cuentas={cuentas} // Pasa las cuentas que ya tienes
        categorias={categorias} // Pasa las categorías que ya tienes
        onSuccess={fetchData} // La función que recarga el dashboard
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="flash" size={24} color="black" />
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAll: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B", // Color de tarjeta que ya usas
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", // Borde muy sutil
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLetter: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
  },
  incomeText: {
    color: "#4ADE80",
  },
  expenseText: {
    color: "#F87171",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    bottom: 30, // Distancia desde abajo
    right: 25, // Distancia desde la derecha
    backgroundColor: "#38BDF8", // El color celeste que venimos usando
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    // Sombra para iOS
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 8,
    zIndex: 999, // Asegura que esté por encima de todo
  },
});
