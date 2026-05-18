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
import { createRecurrente } from "../../services/RecurrentesService";
import { useAccounts } from "../../context/AccountContext";
import { useCategories } from "../../context/CategoryContext";
import DatePickerInput from "../../components/ui/DatePickerInput";
import { useTheme } from "../../theme/useTheme";

const TIPO_OPTIONS = [
  { value: "gasto", label: "Gasto", color: "#F87171" },
  { value: "ingreso", label: "Ingreso", color: "#4ADE80" },
  { value: "transferencia", label: "Transferencia", color: "#38BDF8" },
];

const FRECUENCIA_OPTIONS = [
  "diaria",
  "semanal",
  "quincenal",
  "mensual",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
];

const FRECUENCIA_LABELS = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function CrearRecurrenteScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const { cuentas, refreshAccounts } = useAccounts();
  const { categorias, refreshCategories } = useCategories();

  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [cuentaId, setCuentaId] = useState(null);
  const [categoriaId, setCategoriaId] = useState(null);
  const [diaEjecucion, setDiaEjecucion] = useState("");
  const [proximaEjecucion, setProximaEjecucion] = useState(getTodayString());
  const [fechaFin, setFechaFin] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshAccounts(token).catch(() => {});
    refreshCategories(token).catch(() => {});
  }, [token]);

  // Reset categoria when tipo changes
  useEffect(() => {
    setCategoriaId(null);
  }, [tipo]);

  // Auto-select first account if none selected
  useEffect(() => {
    if (cuentas.length > 0 && cuentaId === null) {
      setCuentaId(cuentas[0].id);
    }
  }, [cuentas]);

  const filteredCategories = categorias.filter((c) => c.tipo === tipo);

  const handleGuardar = async () => {
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      universalAlert("Error", "El monto es obligatorio y debe ser mayor a 0.");
      return;
    }
    if (!cuentaId) {
      universalAlert("Error", "Debes seleccionar una cuenta.");
      return;
    }
    if (
      frecuencia === "mensual" &&
      diaEjecucion !== "" &&
      (isNaN(parseInt(diaEjecucion, 10)) ||
        parseInt(diaEjecucion, 10) < 1 ||
        parseInt(diaEjecucion, 10) > 31)
    ) {
      universalAlert("Error", "El día del mes debe ser un número entre 1 y 31.");
      return;
    }
    if (fechaFin && proximaEjecucion && fechaFin < proximaEjecucion) {
      universalAlert("Error", "La fecha de fin debe ser posterior a la próxima ejecución.");
      return;
    }

    try {
      setSubmitting(true);
      await createRecurrente(token, {
        cuenta_id: cuentaId,
        categoria_id: categoriaId,
        monto,
        tipo,
        frecuencia,
        dia_ejecucion:
          frecuencia === "mensual" && diaEjecucion !== ""
            ? diaEjecucion
            : null,
        proxima_ejecucion: proximaEjecucion || null,
        fecha_fin: fechaFin || null,
        activa: true,
      });
      universalAlert(
        "Recurrente creada",
        "La transacción recurrente ha sido configurada correctamente.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo guardar la recurrente.");
    } finally {
      setSubmitting(false);
    }
  };

  const tipoColor = TIPO_OPTIONS.find((t) => t.value === tipo)?.color ?? theme.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Nueva Recurrente</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Monto — big numeric input */}
      <View style={[styles.montoContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.montoSymbol, { color: tipoColor }]}>$</Text>
        <TextInput
          placeholder="0.00"
          placeholderTextColor={theme.placeholder}
          keyboardType="numeric"
          style={[styles.montoInput, { color: tipoColor }]}
          value={monto}
          onChangeText={setMonto}
        />
      </View>

      {/* Tipo */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo</Text>
      <View style={styles.chipRow}>
        {TIPO_OPTIONS.map((opt) => {
          const selected = tipo === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setTipo(opt.value)}
              style={[
                styles.tipoChip,
                {
                  backgroundColor: selected ? opt.color + "25" : theme.card,
                  borderColor: selected ? opt.color : theme.border ?? theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.tipoChipText,
                  { color: selected ? opt.color : theme.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Frecuencia */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Frecuencia</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
        contentContainerStyle={styles.hScrollContent}
      >
        {FRECUENCIA_OPTIONS.map((opt) => {
          const selected = frecuencia === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setFrecuencia(opt)}
              style={[
                styles.frecuenciaChip,
                {
                  backgroundColor: selected ? theme.primary + "20" : theme.card,
                  borderColor: selected ? theme.primary : theme.border ?? theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.frecuenciaChipText,
                  { color: selected ? theme.primary : theme.textSecondary },
                ]}
              >
                {FRECUENCIA_LABELS[opt]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Día del mes — only for mensual */}
      {frecuencia === "mensual" && (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Día del mes</Text>
          <TextInput
            placeholder="1 – 31"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            maxLength={2}
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            value={diaEjecucion}
            onChangeText={setDiaEjecucion}
          />
        </>
      )}

      {/* Cuenta */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Cuenta *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
        contentContainerStyle={styles.hScrollContent}
      >
        {cuentas.map((cuenta) => {
          const selected = cuentaId === cuenta.id;
          return (
            <TouchableOpacity
              key={cuenta.id}
              onPress={() => setCuentaId(cuenta.id)}
              style={[
                styles.cuentaChip,
                {
                  backgroundColor: selected ? theme.primary + "20" : theme.card,
                  borderColor: selected ? theme.primary : theme.border ?? theme.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.cuentaChipText,
                  { color: selected ? theme.primary : theme.textSecondary },
                ]}
              >
                {cuenta.nombre}
              </Text>
              {cuenta.moneda?.codigo && (
                <Text
                  style={[
                    styles.cuentaChipSub,
                    { color: selected ? theme.primary : theme.textMuted },
                  ]}
                >
                  {cuenta.moneda.codigo}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Categoría */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
        contentContainerStyle={styles.hScrollContent}
      >
        {/* Sin categoría */}
        <TouchableOpacity
          onPress={() => setCategoriaId(null)}
          style={[
            styles.categoriaChip,
            {
              backgroundColor: categoriaId === null ? theme.primary : theme.card,
              borderColor: categoriaId === null ? theme.primary : theme.border ?? theme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.categoriaChipText,
              { color: categoriaId === null ? "white" : theme.textSecondary },
            ]}
          >
            Sin categoría
          </Text>
        </TouchableOpacity>

        {filteredCategories.map((cat) => {
          const selected = categoriaId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoriaId(cat.id)}
              style={[
                styles.categoriaChip,
                {
                  backgroundColor: selected ? (cat.color_hex ?? theme.primary) : theme.card,
                  borderColor: selected
                    ? (cat.color_hex ?? theme.primary)
                    : theme.border ?? theme.card,
                },
              ]}
            >
              {cat.color_hex && !selected && (
                <View style={[styles.catDot, { backgroundColor: cat.color_hex }]} />
              )}
              <Text
                style={[
                  styles.categoriaChipText,
                  { color: selected ? "white" : theme.textSecondary },
                ]}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Próxima ejecución */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Próxima ejecución</Text>
      <DatePickerInput value={proximaEjecucion} onChange={setProximaEjecucion} />

      {/* Fecha de fin */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha de fin (opcional)</Text>
      <DatePickerInput value={fechaFin} onChange={setFechaFin} />

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
            Crear Recurrente
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
  montoContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    gap: 8,
  },
  montoSymbol: {
    fontSize: 32,
    fontWeight: "bold",
  },
  montoInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "bold",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tipoChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tipoChipText: {
    fontSize: 14,
    fontWeight: "700",
  },
  hScroll: {
    marginTop: 2,
  },
  hScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  frecuenciaChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  frecuenciaChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  cuentaChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
  },
  cuentaChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cuentaChipSub: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },
  categoriaChip: {
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
  categoriaChipText: {
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
