import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { updateCategory, deleteCategory, toggleCategoriaActiva } from "../../services/CategoriaService";
import { loadMovimientos } from "../../services/MovimientosService";
import { universalAlert } from "../../utils/universalAlert";

function SkeletonBox({ style }) {
  return <View style={[{ backgroundColor: "#1E293B", borderRadius: 12 }, style]} />;
}

/** Normaliza el icono: añade -outline si no lo tiene, y usa un fallback si es null */
function getIconName(icono, fallback = "pricetag-outline") {
  if (!icono) return fallback;
  if (icono.endsWith("-outline") || icono.endsWith("-sharp")) return icono;
  return `${icono}-outline`;
}

const COLORES_DISPONIBLES = [
  "#38BDF8",
  "#4ADE80",
  "#F87171",
  "#FB923C",
  "#FACC15",
  "#A78BFA",
  "#F472B6",
  "#10B981",
  "#64748B",
];

const ICONOS_DISPONIBLES = [
  "fast-food",
  "cart",
  "car",
  "home",
  "gift",
  "medical",
  "school",
  "shirt",
  "fitness",
  "bus",
  "receipt",
  "game-controller",
  "airplane",
  "briefcase",
  "cash",
  "restaurant",
  "cafe",
  "bicycle",
  "paw",
  "musical-notes",
];

export default function DetalleCategoriaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { categoria: initialCategoria } = route.params;
  const [categoria, setCategoria] = useState(initialCategoria);

  const [editVisible, setEditVisible] = useState(false);
  const [nombre, setNombre] = useState(categoria.nombre);
  const [colorSelected, setColorSelected] = useState(categoria.color_hex);
  // Normalize stored icon to base name (strip -outline/-sharp so grid highlight works)
  const normalizeIcon = (icono) => {
    if (!icono) return ICONOS_DISPONIBLES[0];
    return icono.replace(/-(outline|sharp)$/, "");
  };
  const [iconSelected, setIconSelected] = useState(normalizeIcon(categoria.icono));

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(true);

  const fetchMovimientos = useCallback(async () => {
    setLoadingMov(true);
    try {
      const res = await loadMovimientos(token, { categoria_id: categoria.id });
      setMovimientos(res?.data ?? []);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setLoadingMov(false);
    }
  }, [categoria.id, token]);

  useEffect(() => { fetchMovimientos(); }, [fetchMovimientos]);

  const totalMonto = movimientos.reduce((acc, m) => acc + parseFloat(m.monto || 0), 0);

  const handleToggleActiva = () => {
    const esActiva = categoria.activa !== false;
    universalAlert(
      esActiva ? "Desactivar Categoría" : "Activar Categoría",
      esActiva
        ? `¿Desactivar "${categoria.nombre}"? Ya no aparecerá al registrar movimientos, pero tus datos históricos quedarán intactos.`
        : `¿Activar "${categoria.nombre}"? Volverá a estar disponible para nuevos movimientos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: esActiva ? "Desactivar" : "Activar",
          style: esActiva ? "destructive" : "default",
          onPress: async () => {
            try {
              setDeleting(true);
              const nuevaActiva = !esActiva;
              await toggleCategoriaActiva(categoria.id, nuevaActiva, token);
              setCategoria((prev) => ({ ...prev, activa: nuevaActiva }));
              universalAlert(
                nuevaActiva ? "¡Activada!" : "Categoría desactivada",
                nuevaActiva
                  ? `"${categoria.nombre}" está activa nuevamente.`
                  : `"${categoria.nombre}" fue desactivada. Puedes reactivarla cuando quieras.`
              );
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo actualizar la categoría.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      universalAlert("Error", "El nombre de la categoría es obligatorio.");
      return;
    }
    try {
      setSaving(true);
      const updated = await updateCategory(
        categoria.id,
        { nombre: nombre.trim(), color_hex: colorSelected, icono: iconSelected },
        token
      );
      const newData = updated?.data || updated;
      setCategoria((prev) => ({
        ...prev,
        nombre:    newData?.nombre     || nombre.trim(),
        color_hex: newData?.color_hex  || colorSelected,
        icono:     newData?.icono      || iconSelected,
      }));
      setEditVisible(false);
      universalAlert("¡Éxito!", "Categoría actualizada correctamente.");
    } catch (e) {
      universalAlert("Error", e.message || "No se pudo actualizar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setNombre(categoria.nombre);
    setColorSelected(categoria.color_hex);
    setIconSelected(normalizeIcon(categoria.icono));
    setEditVisible(true);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle Categoría</Text>
        <View style={styles.headerActions}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <TouchableOpacity
                onPress={openEdit}
                style={[styles.iconBtn, { backgroundColor: theme.card }]}
              >
                <Ionicons name="pencil-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleActiva}
                style={[styles.iconBtn, { backgroundColor: theme.card }]}
              >
                <Ionicons
                  name={categoria.activa !== false ? "pause-circle-outline" : "play-circle-outline"}
                  size={20}
                  color={categoria.activa !== false ? "#F87171" : "#4ADE80"}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Banner de categoría inactiva */}
        {categoria.activa === false && (
          <View style={styles.inactiveBanner}>
            <Ionicons name="pause-circle-outline" size={18} color="#FB923C" />
            <Text style={styles.inactiveBannerText}>
              Categoría desactivada — no aparece en nuevos movimientos. Toca{" "}
              <Text style={{ fontWeight: "700" }}>▶</Text> para reactivarla.
            </Text>
          </View>
        )}

        {/* Info de Categoría */}
        <View style={[styles.catInfoCard, categoria.activa === false && { opacity: 0.55 }]}>
          <View style={[styles.iconCircle, { backgroundColor: categoria.color_hex + "20" }]}>
            <Ionicons name={getIconName(categoria.icono)} size={40} color={categoria.color_hex} />
          </View>
          <Text style={[styles.catName, { color: theme.text }]}>{categoria.nombre}</Text>
          <Text style={[styles.catType, { color: theme.textSecondary }]}>
            {categoria.tipo.toUpperCase()}
            {categoria.activa === false ? "  •  INACTIVA" : ""}
          </Text>
        </View>

        {/* Card de Gastos/Ingresos Totales */}
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total registrado</Text>
          {loadingMov ? (
            <SkeletonBox style={{ height: 36, width: 140, marginTop: 6 }} />
          ) : (
            <Text
              style={[
                styles.statsAmount,
                { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
              ]}
            >
              {categoria.tipo === "gasto" ? "- " : "+ "}
              $ {totalMonto.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Lista de Movimientos */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Movimientos relacionados
          </Text>
          {!loadingMov && movimientos.length > 0 && (
            <Text style={[styles.countBadge, { color: theme.textMuted }]}>
              {movimientos.length}
            </Text>
          )}
        </View>

        {/* Skeletons mientras carga */}
        {loadingMov && (
          <View style={{ gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} style={{ height: 60 }} />
            ))}
          </View>
        )}

        {/* Movimientos reales */}
        {!loadingMov && movimientos.length > 0 && movimientos.map((mov) => (
          <View key={mov.id} style={[styles.movCard, { backgroundColor: theme.card }]}>
            <View style={styles.movInfo}>
              <Text style={[styles.movDesc, { color: theme.text }]} numberOfLines={1}>
                {mov.descripcion || "Sin descripción"}
              </Text>
              <Text style={[styles.movDate, { color: theme.textMuted }]}>
                {mov.fecha ? new Date(mov.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : ""}
              </Text>
            </View>
            <Text
              style={[
                styles.movAmount,
                { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
              ]}
            >
              {categoria.tipo === "gasto" ? "- " : "+ "}
              $ {parseFloat(mov.monto).toLocaleString()}
            </Text>
          </View>
        ))}

        {/* Estado vacío */}
        {!loadingMov && movimientos.length === 0 && (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No hay movimientos registrados en esta categoría.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Categoría</Text>

            {/* Scrollable body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Live preview */}
              <View style={[styles.modalPreview, { backgroundColor: theme.background }]}>
                <View style={[styles.modalPreviewIcon, { backgroundColor: colorSelected + "22" }]}>
                  <Ionicons name={getIconName(iconSelected)} size={32} color={colorSelected} />
                </View>
                <Text style={[styles.modalPreviewName, { color: theme.text }]} numberOfLines={1}>
                  {nombre.trim() || "Nombre categoría"}
                </Text>
              </View>

              {/* Nombre */}
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholderTextColor={theme.placeholder}
                placeholder="Nombre de la categoría"
                value={nombre}
                onChangeText={setNombre}
              />

              {/* Icono */}
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Icono</Text>
              <View style={styles.iconGrid}>
                {ICONOS_DISPONIBLES.map((icon) => {
                  const isSelected = iconSelected === icon;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setIconSelected(icon)}
                      style={[
                        styles.iconGridItem,
                        { backgroundColor: theme.background },
                        isSelected && { backgroundColor: colorSelected + "22", borderColor: colorSelected, borderWidth: 1.5 },
                      ]}
                    >
                      <Ionicons
                        name={`${icon}-outline`}
                        size={22}
                        color={isSelected ? colorSelected : theme.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color */}
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Color</Text>
              <View style={styles.colorRow}>
                {COLORES_DISPONIBLES.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setColorSelected(color)}
                    style={[
                      styles.colorChip,
                      { backgroundColor: color },
                      colorSelected === color && styles.colorChipSelected,
                    ]}
                  >
                    {colorSelected === color && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Buttons — fixed at bottom */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { backgroundColor: theme.background }]}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text style={[styles.modalSecondaryText, { color: theme.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
                onPress={handleGuardar}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.modalPrimaryText, { color: theme.background }]}>
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  inactiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FB923C18",
    borderLeftWidth: 3,
    borderLeftColor: "#FB923C",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  inactiveBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#FB923C",
    lineHeight: 18,
  },
  catInfoCard: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  catName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  catType: {
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
  },
  statsCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  statsLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statsAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  countBadge: {
    fontSize: 13,
  },
  movCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  movInfo: {
    flex: 1,
    marginRight: 10,
  },
  movDesc: {
    fontSize: 16,
    fontWeight: "600",
  },
  movDate: {
    fontSize: 13,
    marginTop: 2,
  },
  movAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 30,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  // Live preview inside modal
  modalPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 4,
  },
  modalPreviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPreviewName: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  // Icon grid
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconGridItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorChipSelected: {
    borderWidth: 2.5,
    borderColor: "white",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalSecondaryBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSecondaryText: {
    fontWeight: "600",
    fontSize: 15,
  },
  modalPrimaryBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalPrimaryText: {
    fontWeight: "bold",
    fontSize: 15,
  },
});
