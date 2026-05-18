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
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { loadDeudas } from "../../services/DeudaService";

export default function DeudasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();

  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeudas = useCallback(
    async (isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        const data = await loadDeudas(token);
        setDeudas(data);
      } catch (e) {
        console.error("Error cargando deudas:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      fetchDeudas();
    }, [fetchDeudas])
  );

  const totalPendiente = deudas.reduce((acc, d) => acc + d.saldo_pendiente, 0);
  const deudasActivas = deudas.filter((d) => d.estado !== "pagada");
  const deudasPagadas = deudas.filter((d) => d.estado === "pagada");

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Mis Deudas</Text>
          {totalPendiente > 0 ? (
            <Text style={styles.totalLabel}>
              Pendiente: $ {totalPendiente.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </Text>
          ) : (
            <Text style={[styles.totalLabel, { color: "#4ADE80" }]}>¡Sin deudas pendientes!</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("CrearDeuda")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDeudas(true)}
            tintColor={theme.primary}
          />
        }
      >
        {deudas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin deudas registradas</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Registra una deuda para hacer seguimiento de tus pagos
            </Text>
          </View>
        ) : (
          <>
            {/* Deudas activas */}
            {deudasActivas.map((deuda) => (
              <DeudaCard key={deuda.id} deuda={deuda} theme={theme} navigation={navigation} />
            ))}

            {/* Deudas pagadas */}
            {deudasPagadas.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Pagadas</Text>
                {deudasPagadas.map((deuda) => (
                  <DeudaCard key={deuda.id} deuda={deuda} theme={theme} navigation={navigation} />
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

function DeudaCard({ deuda, theme, navigation }) {
  const saldo = deuda.saldo_pendiente;
  const progreso = deuda.monto_total > 0 ? (deuda.abonado / deuda.monto_total) * 100 : 0;
  const isPagada = deuda.estado === "pagada" || saldo <= 0;

  return (
    <TouchableOpacity
      style={[styles.deudaCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate("DetalleDeuda", { deuda })}
    >
      <View style={styles.deudaHeader}>
        <View style={[styles.iconBox, { backgroundColor: deuda.color + "20" }]}>
          <Ionicons name={deuda.icono} size={22} color={deuda.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.acreedorName, { color: theme.text }]} numberOfLines={1}>
            {deuda.acreedor}
          </Text>
          <Text style={[styles.pendienteText, { color: theme.textSecondary }]}>
            {isPagada
              ? "¡Pagada! ✓"
              : `Faltan $ ${saldo.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`}
          </Text>
        </View>
        {deuda.fecha_vencimiento && !isPagada && (
          <Text style={[styles.fechaVenc, { color: theme.textMuted }]}>
            {new Date(deuda.fecha_vencimiento).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={18} color={theme.border} style={{ marginLeft: 6 }} />
      </View>

      <View style={[styles.progressBg, { backgroundColor: theme.cardSecondary }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progreso, 100)}%`, backgroundColor: isPagada ? "#4ADE80" : deuda.color },
          ]}
        />
      </View>
      <Text style={[styles.progressPct, { color: theme.textMuted }]}>
        {progreso.toFixed(0)}% pagado
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  totalLabel: { color: "#F87171", fontSize: 14, marginTop: 4, fontWeight: "600" },
  addButton: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 10,
  },
  deudaCard: { padding: 18, borderRadius: 20, marginBottom: 12 },
  deudaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  acreedorName: { fontSize: 16, fontWeight: "bold" },
  pendienteText: { fontSize: 13, marginTop: 2 },
  fechaVenc: { fontSize: 11 },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: { fontSize: 11, marginTop: 5, textAlign: "right" },
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
