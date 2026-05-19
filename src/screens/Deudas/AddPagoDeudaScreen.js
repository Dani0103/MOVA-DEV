import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAccounts } from "../../context/AccountContext";
import { useAuth } from "../../context/AuthContext";
import { universalAlert } from "../../utils/universalAlert";
import { registrarPago } from "../../services/DeudaService";
import { useTheme } from "../../theme/useTheme";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay, formatMoneyNumber } from "../../utils/moneyFormatter";

export default function AddPagoDeudaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = useAuth();
  const { cuentas } = useAccounts();

  const { deuda } = route.params;
  // Pre-fill with cuota_mensual if available
  const cuotaDefault = deuda.cuota_mensual
    ? formatMoneyNumber(Math.round(deuda.cuota_mensual), user?.moneda)
    : "";
  const [monto, setMonto] = useState(cuotaDefault);
  const [nota, setNota] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const saldoPendiente = deuda.saldo_pendiente;

  const handleConfirmarPago = async () => {
    const montoNum = parseMoneyDisplay(monto, user?.moneda);

    if (!monto || montoNum <= 0) {
      universalAlert("Error", "Ingresa un monto válido para el pago.");
      return;
    }
    if (montoNum > saldoPendiente) {
      universalAlert("Monto excedido", `El pago no puede superar el saldo pendiente de $${saldoPendiente.toLocaleString("es-CO")}.`);
      return;
    }
    if (!cuentaSeleccionada) {
      universalAlert("Error", "Selecciona una cuenta para realizar el pago.");
      return;
    }

    try {
      setSubmitting(true);
      await registrarPago(token, deuda.id, { monto: montoNum, nota });
      universalAlert(
        "¡Pago Registrado!",
        `Abonaste $${montoNum.toLocaleString("es-CO")} a "${deuda.acreedor}".`,
        [{ text: "Entendido", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo procesar el pago.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Registrar Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumen de Deuda */}
        <View style={styles.deudaSummary}>
          <Text style={[styles.labelCenter, { color: theme.textMuted }]}>Pagando a</Text>
          <View style={[styles.deudaBadge, { borderColor: deuda.color }]}>
            <Ionicons name={deuda.icono} size={18} color={deuda.color} />
            <Text style={[styles.deudaName, { color: theme.text }]}>{deuda.acreedor}</Text>
          </View>
          <Text style={[styles.pendingText, { color: theme.textSecondary }]}>
            Saldo pendiente: $ {saldoPendiente.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
          </Text>
        </View>

        {/* Contexto de cuotas */}
        {deuda.numero_cuotas != null && deuda.numero_cuotas > 0 && (
          <View style={[styles.cuotaInfoCard, { backgroundColor: deuda.color + "15", borderColor: deuda.color + "40" }]}>
            <View style={styles.cuotaInfoRow}>
              <Ionicons name="calendar-outline" size={18} color={deuda.color} />
              <Text style={[styles.cuotaInfoText, { color: deuda.color }]}>
                {deuda.cuota_actual != null
                  ? `Cuota ${deuda.cuota_actual} de ${deuda.numero_cuotas}`
                  : `Cuota ${deuda.cuotas_pagadas + 1} de ${deuda.numero_cuotas}`}
              </Text>
            </View>
            {deuda.cuota_mensual != null && (
              <Text style={[styles.cuotaInfoSub, { color: deuda.color + "CC" }]}>
                Cuota sugerida: $ {Math.round(deuda.cuota_mensual).toLocaleString("es-CO")}
              </Text>
            )}
            {deuda.cuotas_atrasadas > 0 && (
              <View style={styles.atrasadoRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#FB923C" />
                <Text style={styles.atrasadoMsg}>
                  Tienes {deuda.cuotas_atrasadas} cuota{deuda.cuotas_atrasadas !== 1 ? "s" : ""} atrasada{deuda.cuotas_atrasadas !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Input Monto */}
        <View style={styles.amountSection}>
          <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
          <MoneyInput
            style={[styles.amountInput, { color: theme.text }]}
            placeholder="0"
            placeholderTextColor={theme.cardSecondary}
            value={monto}
            onChangeText={setMonto}
            autoFocus
          />
        </View>

        {/* Nota */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nota (opcional)</Text>
        <TextInput
          style={[styles.notaInput, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="Ej: Cuota de mayo..."
          placeholderTextColor={theme.textMuted}
          value={nota}
          onChangeText={setNota}
        />

        {/* Selector de Cuenta */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>¿Desde qué cuenta pagas?</Text>
        <View style={styles.selectorGrid}>
          {cuentas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.accountCard,
                { backgroundColor: theme.card },
                cuentaSeleccionada?.id === c.id && {
                  borderColor: c.color_hex || theme.primary,
                  backgroundColor: (c.color_hex || theme.primary) + "15",
                  borderWidth: 2,
                },
              ]}
              onPress={() => setCuentaSeleccionada(c)}
            >
              <Text
                style={[
                  styles.accountName,
                  { color: theme.text },
                  cuentaSeleccionada?.id === c.id && { color: c.color_hex || theme.primary },
                ]}
              >
                {c.nombre}
              </Text>
              <Text style={[styles.accountBalance, { color: theme.textMuted }]}>
                Disp: $ {parseFloat(c.saldo_actual).toLocaleString("es-CO", { minimumFractionDigits: 0 })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: deuda.color }]}
          onPress={handleConfirmarPago}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirmar Pago</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  closeBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  deudaSummary: { alignItems: "center", marginVertical: 20 },
  labelCenter: { fontSize: 12, textTransform: "uppercase", marginBottom: 8 },
  deudaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  deudaName: { fontWeight: "700" },
  pendingText: { fontSize: 13 },
  amountSection: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 20 },
  currencySymbol: { fontSize: 45, fontWeight: "bold", marginRight: 10 },
  amountInput: { fontSize: 55, fontWeight: "bold", width: "80%", textAlign: "center" },
  label: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 10 },
  notaInput: { padding: 14, borderRadius: 14, fontSize: 15, marginBottom: 5 },
  selectorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
  accountCard: { padding: 16, borderRadius: 16, width: "48%", borderWidth: 2, borderColor: "transparent" },
  accountName: { fontSize: 15, fontWeight: "600" },
  accountBalance: { fontSize: 12, marginTop: 4 },
  confirmBtn: { padding: 20, borderRadius: 18, alignItems: "center", marginTop: 10, elevation: 6 },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  cuotaInfoCard: { borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 6, gap: 4 },
  cuotaInfoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cuotaInfoText: { fontSize: 15, fontWeight: "700" },
  cuotaInfoSub: { fontSize: 12, paddingLeft: 26 },
  atrasadoRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 26, marginTop: 2 },
  atrasadoMsg: { fontSize: 12, color: "#FB923C", fontWeight: "600" },
});
