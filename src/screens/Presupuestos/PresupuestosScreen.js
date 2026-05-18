import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { loadPresupuestos, deletePresupuesto } from "../../services/PresupuestosService";
import { universalAlert } from "../../utils/universalAlert";
import { useTheme } from "../../theme/useTheme";
import UpgradeModal from "../../components/shared/UpgradeModal";

const COLOR_GREEN = "#4ADE80";
const COLOR_ORANGE = "#FB923C";
const COLOR_RED = "#F87171";

function getProgressColor(pct) {
  if (pct >= 90) return COLOR_RED;
  if (pct >= 60) return COLOR_ORANGE;
  return COLOR_GREEN;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatAmount(amount, moneda) {
  const symbol = moneda?.simbolo ?? "$";
  return `${symbol} ${parseFloat(amount).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PresupuestosScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [showUpgrade, setShowUpgrade]   = useState(false);

  const limite = user?.plan?.configuracion?.limite_presupuestos ?? null;
  const limiteAlcanzado = limite !== null && presupuestos.length >= limite;

  const fetchPresupuestos = useCallback(async () => {
    try {
      const data = await loadPresupuestos(token);
      setPresupuestos(data);
    } catch (error) {
      universalAlert("Error", "No se pudieron cargar los presupuestos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPresupuestos();
    }, [fetchPresupuestos])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPresupuestos();
  };

  const handleDelete = (item) => {
    universalAlert(
      "Eliminar presupuesto",
      `¿Seguro que deseas eliminar el presupuesto "${item.categoria?.nombre ?? "General"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePresupuesto(token, item.id);
              setPresupuestos((prev) => prev.filter((p) => p.id !== item.id));
            } catch (error) {
              universalAlert("Error", "No se pudo eliminar el presupuesto.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Presupuestos</Text>
          {limite !== null && (
            <Text style={{ fontSize: 12, marginTop: 2, color: limiteAlcanzado ? "#F87171" : theme.textMuted }}>
              {presupuestos.length}/{limite} usados
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: limiteAlcanzado ? "#F87171" : theme.primary }]}
          onPress={() => limiteAlcanzado ? setShowUpgrade(true) : navigation.navigate("CrearPresupuesto")}
        >
          <Ionicons name={limiteAlcanzado ? "lock-closed" : "add"} size={22} color="white" />
        </TouchableOpacity>
      </View>

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Límite de presupuestos alcanzado"
        message={`Tu plan Gratis permite hasta ${limite} presupuestos. Actualiza al plan Pro para crear presupuestos ilimitados.`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {presupuestos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin presupuestos</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Crea tu primer presupuesto para controlar tus gastos.
            </Text>
          </View>
        ) : (
          presupuestos.map((item) => {
            const pct = Math.min(item.porcentaje_consumido, 100);
            const progressColor = getProgressColor(item.porcentaje_consumido);
            const categoryName = item.categoria?.nombre ?? "General";
            const hasAlert =
              item.notificar_al_llegar_al_percent != null &&
              item.porcentaje_consumido >= item.notificar_al_llegar_al_percent;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, { backgroundColor: theme.card }]}
                activeOpacity={0.85}
                onLongPress={() => handleDelete(item)}
              >
                {/* Card header: category dot + name + period */}
                <View style={styles.cardHeader}>
                  <View style={styles.categoryRow}>
                    {item.categoria ? (
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.categoria.color_hex ?? theme.primary },
                        ]}
                      />
                    ) : (
                      <Ionicons name="wallet-outline" size={16} color={theme.primary} style={styles.categoryIcon} />
                    )}
                    <Text style={[styles.categoryName, { color: theme.text }]}>{categoryName}</Text>
                  </View>

                  {hasAlert && (
                    <View style={[styles.alertChip, { backgroundColor: COLOR_RED + "22" }]}>
                      <Ionicons name="warning-outline" size={12} color={COLOR_RED} />
                      <Text style={[styles.alertChipText, { color: COLOR_RED }]}>
                        {item.notificar_al_llegar_al_percent}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* Period */}
                <Text style={[styles.period, { color: theme.textMuted }]}>
                  {formatDate(item.periodo_inicio)} — {formatDate(item.periodo_fin)}
                </Text>

                {/* Amount line */}
                <View style={styles.amountRow}>
                  <Text style={[styles.consumed, { color: theme.text }]}>
                    {formatAmount(item.monto_consumido, item.moneda)}
                  </Text>
                  <Text style={[styles.limit, { color: theme.textMuted }]}>
                    {" "}de {formatAmount(item.monto_limite, item.moneda)}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBg, { backgroundColor: theme.cardSecondary ?? theme.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: progressColor,
                      },
                    ]}
                  />
                </View>

                {/* Percentage label */}
                <Text style={[styles.pctLabel, { color: progressColor }]}>
                  {item.porcentaje_consumido.toFixed(1)}% utilizado
                </Text>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryIcon: {
    marginRight: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
  },
  alertChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  alertChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  period: {
    fontSize: 12,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  consumed: {
    fontSize: 18,
    fontWeight: "bold",
  },
  limit: {
    fontSize: 13,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  pctLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
