import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../context/CategoryContext";
import { useTheme } from "../../theme/useTheme";
import { universalAlert } from "../../utils/universalAlert";
import { reactivateCategory } from "../../services/CategoriaService";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";

function getIconName(icono, fallback = "pricetag-outline") {
  if (!icono) return fallback;
  if (icono.endsWith("-outline") || icono.endsWith("-sharp")) return icono;
  return `${icono}-outline`;
}

export default function CategoriasInactivasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { categorias, loading, refreshCategories } = useCategories();

  const [refreshing, setRefreshing] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [tab, setTab] = useState("ingreso");

  useEffect(() => {
    refreshCategories(token, user.id);
  }, []);

  const inactivas = useMemo(
    () =>
      categorias.filter(
        (c) =>
          c.activa === false &&
          c.usuario_id == user?.id &&
          c.tipo === tab
      ),
    [categorias, user?.id, tab]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCategories(token, user.id, true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReactivar = (cat) => {
    universalAlert(
      "¿Reactivar categoría?",
      `"${cat.nombre}" volverá a estar disponible para usar en movimientos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reactivar",
          onPress: async () => {
            try {
              setActivatingId(cat.id);
              await reactivateCategory(cat.id, token);
              await refreshCategories(token, user.id, true);
              universalAlert(
                "¡Reactivada!",
                "La categoría volvió a estar disponible."
              );
            } catch (e) {
              universalAlert(
                "Error",
                e.message || "No se pudo reactivar la categoría."
              );
            } finally {
              setActivatingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>
          Categorías inactivas
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.container}>
        <Text style={[styles.helper, { color: theme.textSecondary }]}>
          Estas categorías no se muestran al crear movimientos. Los movimientos
          antiguos las conservan. Puedes reactivarlas cuando quieras.
        </Text>

        {/* Tabs por tipo */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
          {TRANSACTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.tab,
                tab === type.id && {
                  backgroundColor: theme.cardSecondary,
                },
              ]}
              onPress={() => setTab(type.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.textSecondary },
                  tab === type.id && { color: type.color || theme.primary },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginTop: 40 }}
            />
          ) : inactivas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={48}
                  color={theme.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Sin categorías inactivas
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                Todas tus categorías de {tab} están activas.
              </Text>
            </View>
          ) : (
            inactivas.map((cat) => (
              <View
                key={cat.id}
                style={[styles.row, { backgroundColor: theme.card }]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: (cat.color_hex || "#94A3B8") + "20" },
                  ]}
                >
                  <Ionicons
                    name={getIconName(cat.icono)}
                    size={22}
                    color={cat.color_hex || "#94A3B8"}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.catName, { color: theme.text }]}>
                    {cat.nombre}
                  </Text>
                  <Text style={[styles.catMeta, { color: theme.textMuted }]}>
                    Desactivada
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.reactivateBtn, { borderColor: "#4ADE80" }]}
                  onPress={() => handleReactivar(cat)}
                  disabled={activatingId === cat.id}
                >
                  {activatingId === cat.id ? (
                    <ActivityIndicator size="small" color="#4ADE80" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={14} color="#4ADE80" />
                      <Text style={styles.reactivateText}>Reactivar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  topTitle: { fontSize: 18, fontWeight: "700" },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 5,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabText: { fontWeight: "600", fontSize: 13 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    opacity: 0.85,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  catName: { fontSize: 15, fontWeight: "700" },
  catMeta: { fontSize: 12, marginTop: 2 },
  reactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 5,
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  reactivateText: { color: "#4ADE80", fontWeight: "700", fontSize: 12 },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { textAlign: "center", fontSize: 14, lineHeight: 20 },
});
