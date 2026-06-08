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

      {/* Selector de Tipo — carrusel estilo Netflix: 3 visibles + flechas + loop */}
      {(() => {
        const VISIBLE = 3;
        const total = TRANSACTION_TYPES.length;
        const currentIdx = TRANSACTION_TYPES.findIndex((t) => t.id === tab);
        const safeIdx = currentIdx >= 0 ? currentIdx : 0;

        // Calcula el rango visible: el seleccionado va al centro siempre que se puede
        // y aplica modulo para que sea circular
        const startIdx = safeIdx - 1;
        const visibles = Array.from({ length: VISIBLE }, (_, i) => {
          const wrapped = ((startIdx + i) % total + total) % total;
          return { ...TRANSACTION_TYPES[wrapped], _idx: wrapped };
        });

        const goPrev = () => {
          const next = ((safeIdx - 1) % total + total) % total;
          setTab(TRANSACTION_TYPES[next].id);
        };
        const goNext = () => {
          const next = (safeIdx + 1) % total;
          setTab(TRANSACTION_TYPES[next].id);
        };

        return (
          <View style={styles.carouselWrap}>
            <TouchableOpacity
              onPress={goPrev}
              style={[styles.carouselArrow, { backgroundColor: theme.card }]}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              accessibilityLabel="Tipo anterior"
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.carouselTrack}>
              {visibles.map((type, i) => {
                const isActive = type.id === tab;
                return (
                  <TouchableOpacity
                    key={`${type.id}-${i}`}
                    style={[
                      styles.carouselTab,
                      { backgroundColor: theme.card },
                      isActive && {
                        backgroundColor: (type.color || theme.primary) + "20",
                        borderColor: type.color || theme.primary,
                      },
                    ]}
                    onPress={() => setTab(type.id)}
                  >
                    <Text
                      style={[
                        styles.carouselTabText,
                        { color: theme.textSecondary },
                        isActive && {
                          color: type.color || theme.primary,
                          fontWeight: "800",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={goNext}
              style={[styles.carouselArrow, { backgroundColor: theme.card }]}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              accessibilityLabel="Tipo siguiente"
            >
              <Ionicons name="chevron-forward" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
        );
      })()}

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
            {activas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}>
                  <Ionicons name="folder-open-outline" size={60} color="#475569" />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No hay categorías activas
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {inactivas.length > 0
                    ? `Tienes ${inactivas.length} desactivadas. Puedes reactivarlas o crear nuevas.`
                    : `Aún no has agregado categorías de tipo ${tab}.`}
                </Text>
              </View>
            ) : (
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
            )}
          </>
        )}

        {/* Botón: Ver categorías inactivas — solo cuando ya cargaron */}
        {!loading && (
          <TouchableOpacity
            style={[
              styles.inactiveButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => navigation.navigate("CategoriasInactivas")}
          >
            <View style={styles.inactiveButtonLeft}>
              <View style={styles.inactiveIconWrap}>
                <Ionicons name="pause-circle-outline" size={20} color="#FB923C" />
              </View>
              <View>
                <Text style={[styles.inactiveButtonTitle, { color: theme.text }]}>
                  Categorías inactivas
                </Text>
                <Text style={[styles.inactiveButtonSubtitle, { color: theme.textMuted }]}>
                  {inactivas.length > 0
                    ? `${inactivas.length} desactivada${inactivas.length === 1 ? "" : "s"} de ${tab}`
                    : "No tienes inactivas"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
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
  // ━━━ Carrusel de tipos (Netflix-style) ━━━
  carouselWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  carouselArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselTrack: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  carouselTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    minHeight: 40,
    justifyContent: "center",
  },
  carouselTabText: {
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
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
  inactiveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  inactiveButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  inactiveIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(251,146,60,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveButtonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  inactiveButtonSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
