import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import {
  loadRecurrentes,
  deleteRecurrente,
  toggleRecurrente,
} from "../../services/RecurrentesService";
import { universalAlert } from "../../utils/universalAlert";
import { useTheme } from "../../theme/useTheme";

const TIPO_COLORS = {
  gasto: "#F87171",
  ingreso: "#4ADE80",
  transferencia: "#38BDF8",
  prestamo: "#A78BFA",
};

const TIPO_ICONS = {
  gasto: "trending-down-outline",
  ingreso: "trending-up-outline",
  transferencia: "swap-horizontal-outline",
  prestamo: "cash-outline",
};

const TIPO_LABELS = {
  gasto: "Gasto",
  ingreso: "Ingreso",
  transferencia: "Transferencia",
  prestamo: "Préstamo",
};

const FRECUENCIA_LABELS = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function formatAmount(monto, cuenta) {
  const symbol = cuenta?.moneda?.simbolo ?? "$";
  return `${symbol} ${parseFloat(monto).toLocaleString("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RecurrentesScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();

  const [recurrentes, setRecurrentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecurrentes = useCallback(async () => {
    try {
      const data = await loadRecurrentes(token);
      // Sort by proxima_ejecucion ASC (soonest first)
      const sorted = [...data].sort((a, b) => {
        if (!a.proxima_ejecucion) return 1;
        if (!b.proxima_ejecucion) return -1;
        return a.proxima_ejecucion.localeCompare(b.proxima_ejecucion);
      });
      setRecurrentes(sorted);
    } catch (error) {
      universalAlert("Error", "No se pudieron cargar las transacciones recurrentes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchRecurrentes();
    }, [fetchRecurrentes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecurrentes();
  };

  const handleToggle = async (item, newValue) => {
    // Optimistic update
    setRecurrentes((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, activa: newValue } : r))
    );
    try {
      await toggleRecurrente(token, item.id, newValue);
    } catch (error) {
      // Revert on failure
      setRecurrentes((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, activa: !newValue } : r))
      );
      universalAlert("Error", "No se pudo actualizar el estado.");
    }
  };

  const handleDelete = (item) => {
    const label = item.categoria?.nombre ?? TIPO_LABELS[item.tipo] ?? item.tipo;
    universalAlert(
      "Eliminar recurrente",
      `¿Seguro que deseas eliminar "${label}" (${formatAmount(item.monto, item.cuenta)})?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecurrente(token, item.id);
              setRecurrentes((prev) => prev.filter((r) => r.id !== item.id));
            } catch (error) {
              universalAlert("Error", "No se pudo eliminar la recurrente.");
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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Recurrentes</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("CrearRecurrente")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

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
        {recurrentes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin recurrentes</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Automatiza tus gastos e ingresos fijos creando una transacción recurrente.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
              Próximas ejecuciones
            </Text>
            {recurrentes.map((item) => {
              const tipoColor = TIPO_COLORS[item.tipo] ?? "#94A3B8";
              const iconName = item.categoria?.icono
                ? `${item.categoria.icono}-outline`
                : TIPO_ICONS[item.tipo] ?? "repeat-outline";
              const iconColor = item.categoria?.color_hex ?? tipoColor;
              const label = item.categoria?.nombre ?? TIPO_LABELS[item.tipo] ?? item.tipo;
              const frecuenciaLabel = FRECUENCIA_LABELS[item.frecuencia] ?? item.frecuencia;
              const isPositive = item.tipo === "ingreso";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.card,
                    { backgroundColor: theme.card },
                    !item.activa && styles.cardInactive,
                  ]}
                  activeOpacity={0.85}
                  onLongPress={() => handleDelete(item)}
                >
                  <View style={styles.cardRow}>
                    {/* Left icon */}
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: iconColor + "20" },
                      ]}
                    >
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>

                    {/* Center info */}
                    <View style={styles.infoContainer}>
                      <Text
                        style={[
                          styles.labelText,
                          { color: item.activa ? theme.text : theme.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      <Text style={[styles.subText, { color: theme.textMuted }]} numberOfLines={1}>
                        {item.cuenta?.nombre ?? "—"} · {frecuenciaLabel}
                      </Text>
                      <Text style={[styles.nextDate, { color: theme.textMuted }]}>
                        {item.proxima_ejecucion ? formatDate(item.proxima_ejecucion) : "Sin fecha"}
                      </Text>
                    </View>

                    {/* Right: amount + toggle */}
                    <View style={styles.rightContainer}>
                      <Text
                        style={[
                          styles.amountText,
                          { color: isPositive ? TIPO_COLORS.ingreso : tipoColor },
                          !item.activa && { opacity: 0.5 },
                        ]}
                      >
                        {isPositive ? "+" : "-"}
                        {formatAmount(item.monto, item.cuenta)}
                      </Text>
                      <Switch
                        value={item.activa}
                        onValueChange={(val) => handleToggle(item, val)}
                        trackColor={{ false: theme.border, true: theme.primary + "80" }}
                        thumbColor={item.activa ? theme.primary : theme.textMuted}
                        style={styles.switch}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  subText: {
    fontSize: 12,
  },
  nextDate: {
    fontSize: 11,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
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
