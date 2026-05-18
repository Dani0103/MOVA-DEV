import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { universalAlert } from "../../utils/universalAlert";
import { useAuth } from "../../context/AuthContext";
import { createPresupuesto } from "../../services/PresupuestosService";
import { useCategories } from "../../context/CategoryContext";
import DatePickerInput from "../../components/ui/DatePickerInput";
import { useTheme } from "../../theme/useTheme";

const NOTIFY_OPTIONS = [50, 75, 80, 90];

function getFirstDayOfMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function getLastDayOfMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

export default function CrearPresupuestoScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const { categorias, refreshCategories } = useCategories();

  const [montoLimite, setMontoLimite] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState(getFirstDayOfMonth());
  const [periodoFin, setPeriodoFin] = useState(getLastDayOfMonth());
  const [notifyPct, setNotifyPct] = useState(80);
  const [categoriaId, setCategoriaId] = useState(null); // null = sin categoría
  const [submitting, setSubmitting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    refreshCategories(token).catch(() => {});
  }, [token]);

  // Only gasto categories are relevant for expense budgets
  const gastoCategories = categorias.filter((c) => c.tipo === "gasto");

  const handleGuardar = async () => {
    if (!montoLimite || isNaN(parseFloat(montoLimite)) || parseFloat(montoLimite) <= 0) {
      universalAlert("Error", "El monto límite es obligatorio y debe ser mayor a 0.");
      return;
    }
    if (!periodoInicio || !periodoFin) {
      universalAlert("Error", "Debes seleccionar el período del presupuesto.");
      return;
    }
    if (periodoFin < periodoInicio) {
      universalAlert("Error", "La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    try {
      setSubmitting(true);
      await createPresupuesto(token, {
        monto_limite: montoLimite,
        periodo_inicio: periodoInicio,
        periodo_fin: periodoFin,
        notificar_al_llegar_al_percent: notifyPct,
        categoria_id: categoriaId,
      });
      universalAlert(
        "Presupuesto creado",
        "Tu presupuesto ha sido creado correctamente.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo guardar el presupuesto.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Nuevo Presupuesto</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Monto límite */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Monto Límite *</Text>
      <TextInput
        placeholder="0.00"
        placeholderTextColor={theme.placeholder}
        keyboardType="numeric"
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        value={montoLimite}
        onChangeText={setMontoLimite}
      />

      {/* Periodo */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Período</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>Inicio</Text>
          <DatePickerInput value={periodoInicio} onChange={setPeriodoInicio} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.subLabel, { color: theme.textMuted }]}>Fin</Text>
          <DatePickerInput value={periodoFin} onChange={setPeriodoFin} />
        </View>
      </View>

      {/* Notificación */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Notificar al llegar al</Text>
      <View style={styles.chipRow}>
        {NOTIFY_OPTIONS.map((opt) => {
          const selected = notifyPct === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setNotifyPct(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.card,
                  borderColor: selected ? theme.primary : theme.border ?? theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? "white" : theme.textSecondary },
                ]}
              >
                {opt}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categoría */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría (gasto)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {/* "Sin categoría" option */}
        <TouchableOpacity
          onPress={() => setCategoriaId(null)}
          style={[
            styles.categoryChip,
            {
              backgroundColor: categoriaId === null ? theme.primary : theme.card,
              borderColor: categoriaId === null ? theme.primary : theme.border ?? theme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              { color: categoriaId === null ? "white" : theme.textSecondary },
            ]}
          >
            Sin categoría
          </Text>
        </TouchableOpacity>

        {gastoCategories.map((cat) => {
          const selected = categoriaId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoriaId(cat.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selected ? (cat.color_hex ?? theme.primary) : theme.card,
                  borderColor: selected ? (cat.color_hex ?? theme.primary) : theme.border ?? theme.card,
                },
              ]}
            >
              {cat.color_hex && !selected && (
                <View
                  style={[styles.catDot, { backgroundColor: cat.color_hex }]}
                />
              )}
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selected ? "white" : theme.textSecondary },
                ]}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
        onPress={handleGuardar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.saveBtnText, { color: theme.background }]}>
            Crear Presupuesto
          </Text>
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
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryScroll: {
    marginTop: 2,
  },
  categoryScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
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
