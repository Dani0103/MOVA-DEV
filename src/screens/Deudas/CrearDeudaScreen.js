import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { createDeuda } from "../../services/DeudaService";
import { universalAlert } from "../../utils/universalAlert";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay } from "../../utils/moneyFormatter";

const COLORES_DEUDA = ["#F87171", "#FB923C", "#FACC15", "#4ADE80", "#38BDF8", "#A78BFA"];
const ICONOS_DEUDA = [
  "card", "person", "home", "laptop", "car", "briefcase",
  "school", "medkit", "phone-portrait", "gift",
];

/** Amortización francesa — igual que backend */
function calcCuotaMensual(montoTotal, tasaAnual, numeroCuotas) {
  const P = parseFloat(montoTotal) || 0;
  const n = parseInt(numeroCuotas) || 0;
  if (P <= 0 || n <= 0) return null;

  const tasa = parseFloat(tasaAnual) || 0;
  if (tasa <= 0) return P / n;

  const r = (tasa / 100) / 12;
  const factor = Math.pow(1 + r, n);
  return (P * r * factor) / (factor - 1);
}

export default function CrearDeudaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token, user } = useAuth();

  const [acreedor, setAcreedor] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [montoTotalValue, setMontoTotalValue] = useState(0);
  const [tasaInteres, setTasaInteres] = useState("");
  const [numeroCuotas, setNumeroCuotas] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [colorSelected, setColorSelected] = useState(COLORES_DEUDA[0]);
  const [iconSelected, setIconSelected] = useState(ICONOS_DEUDA[0]);
  const [submitting, setSubmitting] = useState(false);

  // Cálculo en tiempo real de cuota mensual
  const cuotaMensual = useMemo(
    () => calcCuotaMensual(montoTotalValue, tasaInteres, numeroCuotas),
    [montoTotalValue, tasaInteres, numeroCuotas]
  );

  const totalAPagar = cuotaMensual !== null && parseInt(numeroCuotas) > 0
    ? cuotaMensual * parseInt(numeroCuotas)
    : null;

  const totalIntereses = totalAPagar !== null
    ? totalAPagar - (montoTotalValue || 0)
    : null;

  const handleGuardar = async () => {
    if (!acreedor.trim()) {
      universalAlert("Error", "Ingresa el nombre del acreedor.");
      return;
    }
    if (!montoTotal || montoTotalValue <= 0) {
      universalAlert("Error", "Ingresa un monto válido mayor a 0.");
      return;
    }

    try {
      setSubmitting(true);
      await createDeuda(token, {
        acreedor: acreedor.trim(),
        descripcion: descripcion.trim() || null,
        monto_total: montoTotalValue,
        tasa_interes_anual: tasaInteres || null,
        numero_cuotas: numeroCuotas || null,
        fecha_inicio: fechaInicio || null,
        color: colorSelected,
        icono: iconSelected,
      });
      universalAlert(
        "¡Deuda registrada!",
        "Podrás hacer seguimiento de tus pagos desde aquí.",
        [{ text: "Entendido", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo guardar la deuda.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nueva Deuda</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview Card */}
      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: colorSelected + "50" }]}>
        <View style={[styles.previewIcon, { backgroundColor: colorSelected + "20" }]}>
          <Ionicons name={iconSelected} size={36} color={colorSelected} />
        </View>
        <Text style={[styles.previewTitle, { color: theme.text }]}>{acreedor || "Acreedor"}</Text>
        <Text style={[styles.previewAmount, { color: colorSelected }]}>
          $ {fmt(montoTotalValue || 0)}
        </Text>

        {/* Cuota preview inline */}
        {cuotaMensual !== null && (
          <View style={[styles.cuotaPreviewRow, { backgroundColor: colorSelected + "18" }]}>
            <View style={styles.cuotaPreviewItem}>
              <Text style={[styles.cuotaPreviewLabel, { color: theme.textMuted }]}>Cuota/mes</Text>
              <Text style={[styles.cuotaPreviewValue, { color: colorSelected }]}>
                $ {fmt(cuotaMensual)}
              </Text>
            </View>
            {totalIntereses !== null && totalIntereses > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.cuotaPreviewItem}>
                  <Text style={[styles.cuotaPreviewLabel, { color: theme.textMuted }]}>Total intereses</Text>
                  <Text style={[styles.cuotaPreviewValue, { color: theme.textSecondary }]}>
                    $ {fmt(totalIntereses)}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.cuotaPreviewItem}>
                  <Text style={[styles.cuotaPreviewLabel, { color: theme.textMuted }]}>Total a pagar</Text>
                  <Text style={[styles.cuotaPreviewValue, { color: theme.text }]}>
                    $ {fmt(totalAPagar)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Acreedor */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>¿A quién le debes?</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="Ej: Banco, Amigo, Tienda..."
        placeholderTextColor={theme.textMuted}
        value={acreedor}
        onChangeText={setAcreedor}
      />

      {/* Monto Total */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Monto Total</Text>
      <MoneyInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="0"
        placeholderTextColor={theme.textMuted}
        value={montoTotal}
        onChangeText={setMontoTotal}
        onChangeValue={setMontoTotalValue}
      />

      {/* Tasa + Cuotas en fila */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Tasa de Interés %</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Ej: 18.5"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={tasaInteres}
            onChangeText={setTasaInteres}
          />
        </View>
        <View style={{ width: 14 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Número de Cuotas</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Ej: 36"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={numeroCuotas}
            onChangeText={setNumeroCuotas}
          />
        </View>
      </View>

      {/* Fecha inicio */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha Inicio de la Deuda</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        placeholder="YYYY-MM-DD (opcional)"
        placeholderTextColor={theme.textMuted}
        value={fechaInicio}
        onChangeText={setFechaInicio}
      />

      {/* Descripción */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, minHeight: 60 }]}
        placeholder="Notas adicionales (opcional)"
        placeholderTextColor={theme.textMuted}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      {/* Selector de Icono */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Ícono</Text>
      <View style={styles.grid}>
        {ICONOS_DEUDA.map((icon) => (
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

      {/* Selector de Color */}
      <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
      <View style={styles.colorRow}>
        {COLORES_DEUDA.map((color) => (
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

      {/* Botón */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colorSelected }]}
        onPress={handleGuardar}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveBtnText}>Registrar Deuda</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 20,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  previewCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    gap: 6,
  },
  previewIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  previewTitle: { fontSize: 18, fontWeight: "700" },
  previewAmount: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  cuotaPreviewRow: {
    flexDirection: "row",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginTop: 6,
    alignSelf: "stretch",
  },
  cuotaPreviewItem: { flex: 1, alignItems: "center" },
  cuotaPreviewLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 },
  cuotaPreviewValue: { fontSize: 14, fontWeight: "700" },
  divider: { width: 1, marginVertical: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 18,
  },
  input: { padding: 16, borderRadius: 16, fontSize: 15 },
  row: { flexDirection: "row" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  colorRow: { flexDirection: "row", gap: 12 },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorActive: { borderWidth: 3, borderColor: "white" },
  saveBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 35,
    elevation: 4,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
