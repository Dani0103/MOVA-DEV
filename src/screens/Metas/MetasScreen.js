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
import { loadMetas } from "../../services/MetasService";
import { universalAlert } from "../../utils/universalAlert";
import { useTheme } from "../../theme/useTheme";

export default function MetasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();

  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetas = useCallback(async () => {
    try {
      const data = await loadMetas(token);
      setMetas(data);
    } catch (error) {
      universalAlert("Error", "No se pudieron cargar tus metas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Recarga cada vez que la pantalla recibe el foco (ej: al volver de CrearMeta)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMetas();
    }, [fetchMetas])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetas();
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
        <Text style={[styles.title, { color: theme.text }]}>Mis Metas</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("CrearMeta")}
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
        {metas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin metas aún</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Crea tu primera meta financiera y empieza a ahorrar.
            </Text>
          </View>
        ) : (
          metas.map((meta) => {
            const progreso = meta.objetivo > 0
              ? (meta.actual / meta.objetivo) * 100
              : 0;
            const completada = progreso >= 100;

            return (
              <TouchableOpacity
                key={meta.id}
                style={[styles.metaCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate("DetalleMeta", { meta })}
              >
                <View style={styles.metaHeader}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: meta.color + "20" },
                    ]}
                  >
                    <Ionicons name={meta.icono} size={22} color={meta.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.metaName, { color: theme.text }]}>{meta.nombre}</Text>
                    <Text style={[styles.metaAmount, { color: theme.textSecondary }]}>
                      $ {meta.actual.toLocaleString()} / ${" "}
                      {meta.objetivo.toLocaleString()}
                    </Text>
                  </View>
                  {completada && (
                    <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                  )}
                </View>

                <View style={[styles.progressBg, { backgroundColor: theme.cardSecondary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progreso, 100)}%`,
                        backgroundColor: meta.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  {progreso.toFixed(0)}% completado
                </Text>
              </TouchableOpacity>
            );
          })
        )}
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
  metaCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  metaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metaName: { fontSize: 16, fontWeight: "bold" },
  metaAmount: { fontSize: 13, marginTop: 2 },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 12,
    marginTop: 8,
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
