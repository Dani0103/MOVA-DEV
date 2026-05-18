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
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { updateCategory, deleteCategory } from "../../services/CategoriaService";
import { universalAlert } from "../../utils/universalAlert";

const COLORES_DISPONIBLES = [
  "#F87171",
  "#FB923C",
  "#FACC15",
  "#4ADE80",
  "#38BDF8",
  "#A78BFA",
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

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const movimientos = [];
  const totalMonto = movimientos.reduce((acc, mov) => acc + mov.monto, 0);

  const handleEliminar = () => {
    universalAlert(
      "Eliminar Categoría",
      `¿Estás seguro de que quieres eliminar "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteCategory(categoria.id, token);
              navigation.goBack();
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo eliminar la categoría.");
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
        { nombre: nombre.trim(), color_hex: colorSelected },
        token
      );
      const newData = updated?.data || updated;
      setCategoria((prev) => ({
        ...prev,
        nombre: newData?.nombre || nombre.trim(),
        color_hex: newData?.color_hex || colorSelected,
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
                onPress={handleEliminar}
                style={[styles.iconBtn, { backgroundColor: theme.card }]}
              >
                <Ionicons name="trash-outline" size={18} color="#F87171" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Info de Categoría */}
        <View style={styles.catInfoCard}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: categoria.color_hex + "20" },
            ]}
          >
            <Ionicons
              name={categoria.icono}
              size={40}
              color={categoria.color_hex}
            />
          </View>
          <Text style={[styles.catName, { color: theme.text }]}>{categoria.nombre}</Text>
          <Text style={[styles.catType, { color: theme.textSecondary }]}>
            {categoria.tipo.toUpperCase()}
          </Text>
        </View>

        {/* Card de Gastos/Ingresos Totales */}
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total este mes</Text>
          <Text
            style={[
              styles.statsAmount,
              { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
            ]}
          >
            {categoria.tipo === "gasto" ? "-" : "+"} ${" "}
            {totalMonto.toLocaleString()}
          </Text>
        </View>

        {/* Lista de Movimientos */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Movimientos relacionados
        </Text>

        {movimientos.length > 0 ? (
          movimientos.map((mov) => (
            <View key={mov.id} style={[styles.movCard, { backgroundColor: theme.card }]}>
              <View style={styles.movInfo}>
                <Text style={[styles.movDesc, { color: theme.text }]}>{mov.descripcion}</Text>
                <Text style={[styles.movDate, { color: theme.textMuted }]}>{mov.fecha}</Text>
              </View>
              <Text
                style={[
                  styles.movAmount,
                  { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
                ]}
              >
                $ {mov.monto.toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
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

            {/* Nombre */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholderTextColor={theme.placeholder}
              placeholder="Nombre de la categoría"
              value={nombre}
              onChangeText={setNombre}
            />

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

            {/* Buttons */}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
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
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
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
    paddingBottom: 40,
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
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  colorChipSelected: {
    borderWidth: 2,
    borderColor: "white",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
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
