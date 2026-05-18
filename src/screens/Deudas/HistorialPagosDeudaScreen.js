import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { loadPagosDeuda } from "../../services/DeudaService";

export default function HistorialPagosDeudaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { deuda } = route.params;
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPagos = useCallback(
    async (isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        const data = await loadPagosDeuda(token, deuda.id);
        setPagos(data);
      } catch (e) {
        console.error("Error cargando pagos:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, deuda.id]
  );

  useFocusEffect(
    useCallback(() => {
      fetchPagos();
    }, [fetchPagos])
  );

  const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

  const renderPago = ({ item, index }) => {
    const fecha = new Date(item.creado_en);
    const fechaStr = fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    const horaStr = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

    return (
      <View style={styles.pagoCard}>
        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={[styles.dot, { backgroundColor: deuda.color }]} />
          {index < pagos.length - 1 && (
            <View style={[styles.line, { backgroundColor: theme.cardSecondary }]} />
          )}
        </View>

        {/* Contenido */}
        <View style={styles.pagoBody}>
          <View style={styles.pagoTop}>
            <Text style={[styles.monto, { color: deuda.color }]}>
              -$ {parseFloat(item.monto).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </Text>
            <View>
              <Text style={[styles.fecha, { color: theme.textSecondary }]}>{fechaStr}</Text>
              <Text style={[styles.hora, { color: theme.textMuted }]}>{horaStr}</Text>
            </View>
          </View>
          {item.nota ? (
            <Text style={[styles.nota, { color: theme.textSecondary }]}>{item.nota}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Historial de Pagos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Resumen */}
      <View style={[styles.summaryCard, { backgroundColor: deuda.color + "18", borderColor: deuda.color + "40" }]}>
        <View style={[styles.deudaBadge, { backgroundColor: theme.card }]}>
          <Ionicons name={deuda.icono} size={18} color={deuda.color} />
          <Text style={[styles.deudaNombre, { color: theme.text }]} numberOfLines={1}>
            {deuda.acreedor}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total pagado</Text>
            <Text style={[styles.summaryValue, { color: deuda.color }]}>
              $ {totalPagado.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Pagos</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{pagos.length}</Text>
          </View>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={deuda.color} />
        </View>
      ) : (
        <FlatList
          data={pagos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPago}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPagos(true)}
              tintColor={deuda.color}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Aún no hay pagos registrados
              </Text>
              <Text style={[styles.emptySubText, { color: theme.textMuted }]}>
                Cada pago que realices aparecerá aquí
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  deudaBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  deudaNombre: { fontSize: 14, fontWeight: "600" },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { width: 1, height: 30 },
  summaryLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 40 },
  pagoCard: { flexDirection: "row", marginBottom: 4 },
  timeline: { width: 28, alignItems: "center", paddingTop: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, marginTop: 4, minHeight: 30 },
  pagoBody: { flex: 1, paddingVertical: 10, paddingLeft: 8, paddingRight: 4, marginBottom: 8 },
  pagoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  monto: { fontSize: 17, fontWeight: "700" },
  fecha: { fontSize: 12, textAlign: "right" },
  hora: { fontSize: 11, textAlign: "right", marginTop: 2 },
  nota: { fontSize: 13, marginTop: 6, fontStyle: "italic" },
  emptyContainer: { paddingTop: 60, alignItems: "center", gap: 12, paddingHorizontal: 30 },
  emptyText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySubText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
