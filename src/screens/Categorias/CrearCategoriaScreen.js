import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { universalAlert } from "../../utils/universalAlert";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";
import { useAuth } from "../../context/AuthContext";
import { createCategory } from "../../services/CategoriaService";
import { useCategories } from "../../context/CategoryContext";

// Colores consistentes con CrearCuenta
const COLORES_DISPONIBLES = [
  "#38BDF8",
  "#4ADE80",
  "#F87171",
  "#FB923C",
  "#A78BFA",
  "#F472B6",
  "#10B981",
  "#64748B",
];

// Lista de iconos sugeridos para finanzas
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
];

export default function CrearCategoriaScreen() {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { refreshCategories } = useCategories();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("ingreso");
  const [colorSelected, setColorSelected] = useState(COLORES_DISPONIBLES[0]);
  const [iconSelected, setIconSelected] = useState(ICONOS_DISPONIBLES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    // 1. Validación de campos locales
    if (!nombre.trim()) {
      universalAlert("Error", "El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setSubmitting(true);

      const formData = {
        nombre: nombre.trim(),
        tipo: tipo,
        padre: null,
        icono: iconSelected,
        color_hex: colorSelected,
      };

      const response = await createCategory(formData, token);
      if (response) {
        if (refreshCategories) {
          await refreshCategories(token, user.id, true);
        }

        universalAlert("¡Éxito!", "Categoría creada correctamente.", [
          {
            text: "OK",
            onPress: () => {
              // Opcional: Podrías pasar un parámetro para refrescar la lista al volver
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error en createCategory:", error);

      // 4. Manejo de errores específicos (opcional)
      const mensajeError =
        error.response?.data?.message || "No se pudo crear la categoría";
      universalAlert("Error", mensajeError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Nueva Categoría</Text>

      {/* Vista Previa */}
      <View style={styles.previewContainer}>
        <View
          style={[styles.iconCircle, { backgroundColor: colorSelected + "20" }]}
        >
          <Ionicons name={iconSelected} size={40} color={colorSelected} />
        </View>
        <Text style={styles.previewText}>{nombre || "Nombre categoría"}</Text>
      </View>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        placeholder="Ej: Gimnasio, Freelance..."
        placeholderTextColor="#64748B"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.selectorContainer}>
        {TRANSACTION_TYPES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.selectorButton,
              tipo === item.id && {
                borderColor: item.color,
                backgroundColor: item.color + "15",
              },
            ]}
            onPress={() => setTipo(item.id)}
          >
            <Text
              style={[
                styles.selectorText,
                tipo === item.id && { color: item.color },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Icono</Text>
      <View style={styles.gridContainer}>
        {ICONOS_DISPONIBLES.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => setIconSelected(icon)}
            style={[
              styles.gridItem,
              iconSelected === icon && {
                backgroundColor: "#1E293B",
                borderColor: colorSelected,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={24}
              color={iconSelected === icon ? colorSelected : "#64748B"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.gridContainer}>
        {COLORES_DISPONIBLES.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setColorSelected(color)}
            style={[
              styles.colorCircleSmall,
              { backgroundColor: color },
              colorSelected === color && styles.colorSelected,
            ]}
          >
            {colorSelected === color && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGuardar}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  previewContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  previewText: { color: "white", fontSize: 18, fontWeight: "600" },
  label: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    color: "white",
    fontSize: 16,
  },
  selectorContainer: { flexDirection: "row", gap: 10 },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    alignItems: "center",
  },
  selectorText: { color: "#94A3B8", fontWeight: "600" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  gridItem: {
    width: 50,
    height: 50,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  colorCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSelected: { borderColor: "white", borderWidth: 2 },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 30, marginBottom: 50 },
  button: {
    flex: 1,
    backgroundColor: "#38BDF8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", color: "#0F172A", fontSize: 16 },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#94A3B8", fontWeight: "600", fontSize: 16 },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "transparent",
  },
});
