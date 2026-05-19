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
import { useAuth } from "../../context/AuthContext";
import { createMeta } from "../../services/MetasService";
import { useTheme } from "../../theme/useTheme";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay } from "../../utils/moneyFormatter";

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
  const theme = useTheme();
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");
  const [montoInicial, setMontoInicial] = useState("");
  const [colorSelected, setColorSelected] = useState(COLORES_METAS[0]);
  const [iconSelected, setIconSelected] = useState(ICONOS_METAS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !montoObjetivo || parseMoneyDisplay(montoObjetivo, user?.moneda) <= 0) {
      universalAlert(
        "Error",
        "El nombre y el monto objetivo son obligatorios.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await createMeta(token, {
        nombre,
        montoObjetivo: parseMoneyDisplay(montoObjetivo, user?.moneda),
        montoInicial: parseMoneyDisplay(montoInicial, user?.moneda),
        color: colorSelected,
        icono: iconSelected,
      });
      universalAlert(
        "¡Meta Creada!",
        "Empieza a ahorrar para cumplir tu sueño.",
        [{ text: "¡Vamos!", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo guardar la meta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Nueva Meta</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview Visual */}
      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View
          style={[styles.iconBox, { backgroundColor: colorSelected + "20" }]}
        >
          <Ionicons name={iconSelected} size={35} color={colorSelected} />
        </View>
        <Text style={[styles.previewTitle, { color: theme.text }]}>{nombre || "Título de la meta"}</Text>
        <Text style={[styles.previewSub, { color: theme.primary }]}>
          $ {(parseMoneyDisplay(montoObjetivo, user?.moneda) || 0).toLocaleString()}
        </Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>¿Qué quieres lograr?</Text>
      <TextInput
        placeholder="Ej: Viaje a Europa, Fondo de paz mental..."
        placeholderTextColor={theme.placeholder}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={nombre}
        onChangeText={setNombre}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Monto Objetivo</Text>
          <MoneyInput
            placeholder="0.00"
            placeholderTextColor={theme.placeholder}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={montoObjetivo}
            onChangeText={setMontoObjetivo}
          />
        </View>
        <View style={{ width: 15 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Ahorro Inicial</Text>
          <MoneyInput
            placeholder="Opcional"
            placeholderTextColor={theme.placeholder}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={montoInicial}
            onChangeText={setMontoInicial}
          />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Selecciona un Icono</Text>
      <View style={styles.grid}>
        {ICONOS_METAS.map((icon) => (
          <TouchableOpacity
            key={icon}
            onPress={() => setIconSelected(icon)}
            style={[
              styles.iconItem,
              { backgroundColor: theme.card },
              iconSelected === icon && {
                borderColor: colorSelected,
                borderWidth: 2,
              },
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

      <Text style={[styles.label, { color: theme.textSecondary }]}>Personaliza el Color</Text>
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
        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
        onPress={handleGuardar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.saveBtnText, { color: theme.background }]}>Crear Meta Financiera</Text>
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
    borderStyle: "dashed",
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
  previewSub: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  row: { flexDirection: "row" },
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
  saveBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { fontWeight: "bold", fontSize: 16 },
});
