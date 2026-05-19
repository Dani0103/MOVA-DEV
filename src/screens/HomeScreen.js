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
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const TIPO_ICONS = {
  gasto:        "trending-down-outline",
  ingreso:      "trending-up-outline",
  transferencia:"swap-horizontal-outline",
  prestamo:     "cash-outline",
};

export default function HomeScreen() {
  const theme = useTheme();
  const { isDark } = useThemeContext();
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    saldoDisponible: 0,
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
    movimientos: [],
  });

  const { categorias, loading: loadingCategorias, refreshCategories } = useCategories();
  const { cuentas, loading: loadingCuentas, refreshAccounts } = useAccounts();

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
          { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Saldo con validación de número */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Saldo Disponible</Text>
          <Text style={[styles.balanceAmount, { color: theme.primary }]}>
            $ {(data.saldoDisponible || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.incomeCard, { backgroundColor: isDark ? "#064E3B" : "#F0FDF4" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "white" : "#166534" }]}>Ingresos</Text>
            <Text style={[styles.income, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
              +$ {(data.ingresos || 0).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.expenseCard, { backgroundColor: isDark ? "#7F1D1D" : "#FEF2F2" }]}>
            <Text style={[styles.cardTitle, { color: isDark ? "white" : "#991B1B" }]}>Gastos</Text>
            <Text style={[styles.expense, { color: isDark ? "#F87171" : "#DC2626" }]}>
              -$ {(data.gastos || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.savingsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Ahorro del Mes</Text>
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Últimos Movimientos</Text>
            {/* <Text style={styles.seeAll}>Ver todos</Text> */}
          </View>

          {data.movimientos.length > 0 ? (
            data.movimientos.map((item) => {
              const catColor  = item.categoria?.color_hex ?? item.cuenta_origen?.color_hex ?? theme.primary;
              const iconName  = item.categoria?.icono
                ? `${item.categoria.icono}-outline`
                : TIPO_ICONS[item.tipo] ?? "swap-horizontal-outline";
              const isIngreso = item.tipo === "ingreso";
              const amountColor = isIngreso ? "#4ADE80" : "#F87171";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.transactionCard, { backgroundColor: theme.card }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("Movimientos", {
                    screen: "DetalleMovimiento",
                    // timestamp fuerza a React Navigation a detectar el cambio de params
                    // aunque el componente ya estuviera montado en el stack
                    params: { movimiento: item, _ts: Date.now() },
                  })}
                >
                  {/* Icono con color de categoría */}
                  <View style={[styles.iconCircle, { backgroundColor: catColor + "22" }]}>
                    <Ionicons name={iconName} size={20} color={catColor} />
                  </View>

                  {/* Info central */}
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
                      {item.categoria?.nombre ?? item.tipo}
                    </Text>

                    {/* Descripción — línea nueva */}
                    {!!item.descripcion && (
                      <Text style={[styles.descriptionText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.descripcion}
                      </Text>
                    )}

                    <Text style={[styles.detailsText, { color: theme.textMuted }]}>
                      {item.cuenta_origen?.nombre ?? "—"} •{" "}
                      {new Date(item.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Text>
                  </View>

                  {/* Monto */}
                  <View style={styles.amountContainer}>
                    <Text style={[styles.amountText, { color: amountColor }]}>
                      {isIngreso ? "+" : "-"}$
                      {Math.abs(parseFloat(item.monto)).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                      })}
                    </Text>
                    {item.cuenta_origen?.moneda?.codigo ? (
                      <Text style={[styles.currencyCode, { color: theme.textMuted }]}>
                        {item.cuenta_origen.moneda.codigo}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={40} color={theme.border} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No hay movimientos registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <QuickMovementModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        cuentas={cuentas}
        categorias={categorias}
        loadingCuentas={loadingCuentas}
        loadingCategorias={loadingCategorias}
        onSuccess={fetchData}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
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
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  balanceLabel: {},
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
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
    fontSize: 18,
    marginBottom: 10,
  },
  transaction: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionText: {},
  savingsCard: {
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
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  detailsText: {
    fontSize: 11,
    marginTop: 1,
  },
  amountContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
  },
  currencyCode: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    bottom: 30, // Distancia desde abajo
    right: 25, // Distancia desde la derecha
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    // Sombra para iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 8,
    zIndex: 999, // Asegura que esté por encima de todo
  },
});
