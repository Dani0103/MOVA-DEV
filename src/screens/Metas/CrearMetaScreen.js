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

const COLORES_METAS = [
  "#38BDF8",
  "#4ADE80",
  "#FB923C",
  "#A78BFA",
  "#F472B6",
  "#FACC15",
];
const ICONOS_METAS = [
  "airplane",
  "car",
  "home",
  "briefcase",
  "gift",
  "trophy",
  "shield-checkmark",
  "laptop",
  "cart",
];

export default function CrearMetaScreen() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");
  const [montoInicial, setMontoInicial] = useState("");
  const [colorSelected, setColorSelected] = useState(COLORES_METAS[0]);
  const [iconSelected, setIconSelected] = useState(ICONOS_METAS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !montoObjetivo) {
      universalAlert(
        "Error",
        "El nombre y el monto objetivo son obligatorios.",
      );
      return;
    }

    try {
      setSubmitting(true);
      // Simulación de guardado
      console.log({
        nombre,
        objetivo: parseFloat(montoObjetivo),
        actual: parseFloat(montoInicial || 0),
        color: colorSelected,
        icono: iconSelected,
      });

      universalAlert(
        "¡Meta Creada!",
        "Empieza a ahorrar para cumplir tu sueño.",
        [{ text: "¡Vamos!", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      universalAlert("Error", "No se pudo guardar la meta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Meta</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview Visual */}
      <View style={styles.previewCard}>
        <View
          style={[styles.iconBox, { backgroundColor: colorSelected + "20" }]}
        >
          <Ionicons name={iconSelected} size={35} color={colorSelected} />
        </View>
        <Text style={styles.previewTitle}>{nombre || "Título de la meta"}</Text>
        <Text style={styles.previewSub}>
          $ {(parseFloat(montoObjetivo) || 0).toLocaleString()}
        </Text>
      </View>

      <Text style={styles.label}>¿Qué quieres lograr?</Text>
      <TextInput
        placeholder="Ej: Viaje a Europa, Fondo de paz mental..."
        placeholderTextColor="#64748B"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Monto Objetivo</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            style={styles.input}
            value={montoObjetivo}
            onChangeText={setMontoObjetivo}
          />
        </View>
        <View style={{ width: 15 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Ahorro Inicial</Text>
          <TextInput
            placeholder="Opcional"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            style={styles.input}
            value={montoInicial}
            onChangeText={setMontoInicial}
          />
        </View>
      </View>

      <Text style={styles.label}>Selecciona un Icono</Text>
      <View style={styles.grid}>
        {ICONOS_METAS.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => setIconSelected(icon)}
            style={[
              styles.iconItem,
              iconSelected === icon && {
                borderColor: colorSelected,
                borderWidth: 2,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={iconSelected === icon ? colorSelected : "#64748B"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Personaliza el Color</Text>
      <View style={styles.colorGrid}>
        {COLORES_METAS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setColorSelected(color)}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              colorSelected === color && styles.colorActive,
            ]}
          >
            {colorSelected === color && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleGuardar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text style={styles.saveBtnText}>Crear Meta Financiera</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    marginBottom: 20,
  },
  backBtn: { padding: 8, backgroundColor: "#1E293B", borderRadius: 12 },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  previewCard: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 25,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: { color: "white", fontSize: 18, fontWeight: "700" },
  previewSub: {
    color: "#38BDF8",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  label: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    color: "white",
    fontSize: 16,
  },
  row: { flexDirection: "row" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconItem: {
    width: 50,
    height: 50,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  colorGrid: { flexDirection: "row", gap: 12 },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorActive: { borderWidth: 2, borderColor: "white" },
  saveBtn: {
    backgroundColor: "#38BDF8",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#38BDF8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { color: "#0F172A", fontWeight: "bold", fontSize: 16 },
});
