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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { universalAlert } from "../../utils/universalAlert";
import { useAuth } from "../../context/AuthContext";
import { updateMeta } from "../../services/MetasService";
import { useTheme } from "../../theme/useTheme";
import DatePickerInput from "../../components/ui/DatePickerInput";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay, formatMoneyNumber } from "../../utils/moneyFormatter";

const COLORES_METAS = ["#38BDF8", "#4ADE80", "#FB923C", "#A78BFA", "#F472B6", "#FACC15"];
const ICONOS_METAS = [
  "airplane", "car", "home", "briefcase", "gift",
  "trophy", "shield-checkmark", "laptop", "cart",
];

export default function EditarMetaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = useAuth();

  const { meta } = route.params;

  const [nombre, setNombre] = useState(meta.nombre ?? "");
  const [montoObjetivo, setMontoObjetivo] = useState(formatMoneyNumber(meta.objetivo, user?.moneda));
  const [fechaLimite, setFechaLimite] = useState(meta.fecha_limite ?? "");
  const [colorSelected, setColorSelected] = useState(meta.color ?? COLORES_METAS[0]);
  const [iconSelected, setIconSelected] = useState(meta.icono ?? ICONOS_METAS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      universalAlert("Error", "El nombre es obligatorio.");
      return;
    }
    if (!montoObjetivo || parseMoneyDisplay(montoObjetivo, user?.moneda) <= 0) {
      universalAlert("Error", "Ingresa un monto objetivo válido.");
      return;
    }

    try {
      setSubmitting(true);
      await updateMeta(token, meta.id, {
        nombre: nombre.trim(),
        monto_objetivo: parseMoneyDisplay(montoObjetivo, user?.moneda),
        fecha_objetivo: fechaLimite || null,
        color: colorSelected,
        icono: iconSelected,
      });
      universalAlert(
        "¡Meta actualizada!",
        "Los cambios se guardaron correctamente.",
        [{ text: "Entendido", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo actualizar la meta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Editar Meta</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview */}
      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: colorSelected + "50" }]}>
        <View style={[styles.iconBox, { backgroundColor: colorSelected + "20" }]}>
          <Ionicons name={iconSelected} size={35} color={colorSelected} />
        </View>
        <Text style={[styles.previewTitle, { color: theme.text }]}>{nombre || "Título de la meta"}</Text>
        <Text style={[styles.previewSub, { color: colorSelected }]}>
          $ {(parseMoneyDisplay(montoObjetivo, user?.moneda) || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>¿Qué quieres lograr?</Text>
      <TextInput
        placeholder="Ej: Viaje a Europa..."
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Monto Objetivo</Text>
      <MoneyInput
        placeholder="0"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={montoObjetivo}
        onChangeText={setMontoObjetivo}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha Límite (opcional)</Text>
      <DatePickerInput value={fechaLimite || undefined} onChange={setFechaLimite} />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Ícono</Text>
      <View style={styles.grid}>
        {ICONOS_METAS.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => setIconSelected(icon)}
            style={[
              styles.iconItem,
              { backgroundColor: theme.card },
              iconSelected === icon && { borderColor: colorSelected, borderWidth: 2 },
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={iconSelected === icon ? colorSelected : theme.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
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
            {colorSelected === color && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colorSelected }]}
        onPress={handleGuardar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 20,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: "bold" },
  previewCard: {
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
  },
  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: { fontSize: 18, fontWeight: "700" },
  previewSub: { fontSize: 20, fontWeight: "bold", marginTop: 5 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  input: { padding: 16, borderRadius: 16, fontSize: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconItem: {
    width: 50,
    height: 50,
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
  saveBtn: { padding: 18, borderRadius: 16, alignItems: "center", marginTop: 40, elevation: 4 },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
