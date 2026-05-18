import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../context/CategoryContext";
import { GetCategories } from "../../services/CategoriaService";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";
import { useTheme } from "../../theme/useTheme";

/**
 * Normaliza el nombre del icono para Ionicons:
 * - null/undefined → fallback
 * - "fast-food" → "fast-food-outline"   (añade -outline si no lo tiene)
 * - "fast-food-outline" → sin cambio
 */
function getIconName(icono, fallback = "pricetag-outline") {
  if (!icono) return fallback;
  if (icono.endsWith("-outline") || icono.endsWith("-sharp")) return icono;
  return `${icono}-outline`;
}

export default function CategoriasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const { categorias, loading, refreshCategories } = useCategories();
  const [tab, setTab] = useState("ingreso"); // 'gasto' o 'ingreso'

  useEffect(() => {
    refreshCategories(token, user.id);
  }, []);

  const todasFiltradas  = categorias.filter((c) => c.tipo === tab && c.usuario_id == user?.id);
  const activas         = todasFiltradas.filter((c) => c.activa !== false);
  const inactivas       = todasFiltradas.filter((c) => c.activa === false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header con Título y Botón de Añadir */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Categorías</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("CrearCategoria")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Selector de Tipo (Tabs) */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {TRANSACTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.tab,
                tab === type.id && [styles.tabActive, { backgroundColor: theme.cardSecondary }],
                { minWidth: 100 }, // Asegura espacio para el texto
              ]}
              onPress={() => setTab(type.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.textSecondary },
                  tab === type.id && { color: type.color || theme.primary }, // Usa el color de la constante
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: 20 }} />
        ) : todasFiltradas.length === 0 ? (
          /* Estado vacío */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="folder-open-outline" size={60} color="#475569" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay categorías</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Aún no has agregado categorías de tipo {tab}.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.cardSecondary, borderColor: "#475569" }]}
              onPress={() => navigation.navigate("CrearCategoria")}
            >
              <Text style={[styles.emptyButtonText, { color: theme.primary }]}>
                Crear primera categoría
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Categorías activas */}
            <View style={styles.grid}>
              {activas.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate("DetalleCategoria", { categoria: cat })}
                >
                  <View style={[styles.iconCircle, { backgroundColor: cat.color_hex + "20" }]}>
                    <Ionicons name={getIconName(cat.icono)} size={24} color={cat.color_hex} />
                  </View>
                  <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categorías inactivas */}
            {inactivas.length > 0 && (
              <>
                <View style={styles.inactiveDivider}>
                  <View style={[styles.inactiveLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.inactiveLabel, { color: theme.textMuted }]}>
                    Desactivadas ({inactivas.length})
                  </Text>
                  <View style={[styles.inactiveLine, { backgroundColor: theme.border }]} />
                </View>

                <View style={styles.grid}>
                  {inactivas.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, styles.categoryCardInactive, { backgroundColor: theme.card }]}
                      onPress={() => navigation.navigate("DetalleCategoria", { categoria: cat })}
                    >
                      {/* Overlay badge */}
                      <View style={styles.inactiveBadge}>
                        <Ionicons name="pause-circle" size={14} color="#FB923C" />
                      </View>
                      <View style={[styles.iconCircle, { backgroundColor: cat.color_hex + "10" }]}>
                        <Ionicons name={cat.icono} size={24} color={cat.color_hex + "80"} />
                      </View>
                      <Text style={[styles.categoryName, { color: theme.textMuted }]} numberOfLines={1}>
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {},
  tabText: {
    fontWeight: "600",
  },
  tabTextActive: {},
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%", // Dos columnas
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontWeight: "600",
    fontSize: 14,
  },
  categoryCardInactive: {
    opacity: 0.6,
  },
  inactiveBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  inactiveDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  inactiveLine: {
    flex: 1,
    height: 1,
  },
  inactiveLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dotsBtn: {
    position: "absolute",
    right: 5,
    top: 10,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
});
