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
import { loadAportes } from "../../services/MetasService";

export default function HistorialAportesScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { meta } = route.params;
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAportes = useCallback(
    async (isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        const data = await loadAportes(token, meta.id);
        setAportes(data);
      } catch (e) {
        console.error("Error cargando aportes:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, meta.id]
  );

  useFocusEffect(
    useCallback(() => {
      fetchAportes();
    }, [fetchAportes])
  );

  const totalAportado = aportes.reduce((sum, a) => sum + parseFloat(a.monto), 0);

  const renderAporte = ({ item, index }) => {
    const fecha = new Date(item.creado_en);
    const fechaStr = fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const horaStr = fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.aporteCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Línea de tiempo */}
        <View style={styles.timeline}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          {index < aportes.length - 1 && (
            <View style={[styles.line, { backgroundColor: theme.cardSecondary }]} />
          )}
        </View>

        {/* Contenido */}
        <View style={styles.aporteBody}>
          <View style={styles.aporteTop}>
            <Text style={[styles.monto, { color: meta.color }]}>
              +$ {parseFloat(item.monto).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Historial de Aportes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Resumen */}
      <View style={[styles.summaryCard, { backgroundColor: meta.color + "18", borderColor: meta.color + "40" }]}>
        <View style={[styles.metaBadge, { backgroundColor: theme.card }]}>
          <Ionicons name={meta.icono} size={18} color={meta.color} />
          <Text style={[styles.metaNombre, { color: theme.text }]} numberOfLines={1}>
            {meta.nombre}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total aportado</Text>
            <Text style={[styles.summaryValue, { color: meta.color }]}>
              $ {totalAportado.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Aportes</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{aportes.length}</Text>
          </View>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={meta.color} />
        </View>
      ) : (
        <FlatList
          data={aportes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAporte}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAportes(true)}
              tintColor={meta.color}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Aún no hay aportes registrados
              </Text>
              <Text style={[styles.emptySubText, { color: theme.textMuted }]}>
                Cada vez que añadas dinero a esta meta aparecerá aquí
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
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  metaNombre: { fontSize: 14, fontWeight: "600" },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { width: 1, height: 30 },
  summaryLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: "bold" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 40 },

  aporteCard: {
    flexDirection: "row",
    marginBottom: 4,
  },

  // Timeline
  timeline: {
    width: 28,
    alignItems: "center",
    paddingTop: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 30,
  },

  // Body
  aporteBody: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 4,
    marginBottom: 8,
  },
  aporteTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  monto: { fontSize: 17, fontWeight: "700" },
  fecha: { fontSize: 12, textAlign: "right" },
  hora: { fontSize: 11, textAlign: "right", marginTop: 2 },
  nota: { fontSize: 13, marginTop: 6, fontStyle: "italic" },

  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 30,
  },
  emptyText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySubText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
