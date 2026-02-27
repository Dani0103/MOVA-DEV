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
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("gasto"); // gasto o ingreso
  const [colorSelected, setColorSelected] = useState(COLORES_DISPONIBLES[0]);
  const [iconSelected, setIconSelected] = useState(ICONOS_DISPONIBLES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre) {
      universalAlert("Error", "El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      // Aquí irá tu llamada al servicio de Laravel
      // const response = await createCategory({ nombre, tipo, icono: iconSelected, color: colorSelected }, token);

      console.log("Guardando:", { nombre, tipo, iconSelected, colorSelected });

      universalAlert("¡Éxito!", "Categoría creada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      universalAlert("Error", "No se pudo crear la categoría");
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
        {["gasto", "ingreso"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.selectorButton,
              tipo === t && {
                backgroundColor: (t === "gasto" ? "#F87171" : "#4ADE80") + "20",
                borderColor: t === "gasto" ? "#F87171" : "#4ADE80",
                borderWidth: 1,
              },
            ]}
            onPress={() => setTipo(t)}
          >
            <Text
              style={[
                styles.selectorText,
                tipo === t && {
                  color: t === "gasto" ? "#F87171" : "#4ADE80",
                  fontWeight: "bold",
                },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
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
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
});
