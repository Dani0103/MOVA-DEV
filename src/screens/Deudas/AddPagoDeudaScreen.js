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
import { universalAlert } from "../../utils/universalAlert";

export default function AddPagoDeudaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Obtenemos la deuda de los parámetros de navegación
  const { deuda } = route.params;
  const { cuentas } = useAccounts();

  const [monto, setMonto] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const saldoPendiente = deuda.monto_total - deuda.abonado;

  const handleConfirmarPago = async () => {
    const montoNum = parseFloat(monto);

    if (!monto || montoNum <= 0) {
      universalAlert("Error", "Ingresa un monto válido para el pago.");
      return;
    }

    if (montoNum > saldoPendiente) {
      universalAlert(
        "Monto excedido",
        "El pago no puede ser mayor al saldo pendiente.",
      );
      return;
    }

    if (!cuentaSeleccionada) {
      universalAlert("Error", "Selecciona una cuenta para realizar el pago.");
      return;
    }

    try {
      setSubmitting(true);

      // Simulación de lógica:
      // 1. POST /pagos-deuda { deuda_id, cuenta_id, monto }
      console.log(
        `Pagando $${montoNum} a ${deuda.acreedor} desde ${cuentaSeleccionada.nombre}`,
      );

      universalAlert(
        "¡Pago Registrado!",
        "El saldo de tu deuda ha sido actualizado.",
        [{ text: "Entendido", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      universalAlert("Error", "No se pudo procesar el pago en este momento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Resumen de Deuda */}
        <View style={styles.deudaSummary}>
          <Text style={styles.labelCenter}>Pagando a</Text>
          <View style={[styles.deudaBadge, { borderColor: deuda.color }]}>
            <Ionicons name={deuda.icono} size={18} color={deuda.color} />
            <Text style={styles.deudaName}>{deuda.acreedor}</Text>
          </View>
          <Text style={styles.pendingText}>
            Saldo pendiente: ${saldoPendiente.toLocaleString()}
          </Text>
        </View>

        {/* Input de Monto Estilizado */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#334155"
            keyboardType="numeric"
            value={monto}
            onChangeText={setMonto}
            autoFocus
          />
        </View>

        {/* Selector de Cuentas */}
        <Text style={styles.label}>¿Desde qué cuenta pagas?</Text>
        <View style={styles.selectorGrid}>
          {cuentas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.accountCard,
                cuentaSeleccionada?.id === c.id && {
                  borderColor: c.color_hex || "#38BDF8",
                  backgroundColor: (c.color_hex || "#38BDF8") + "15",
                  borderWidth: 2,
                },
              ]}
              onPress={() => setCuentaSeleccionada(c)}
            >
              <Text
                style={[
                  styles.accountName,
                  cuentaSeleccionada?.id === c.id && {
                    color: c.color_hex || "#38BDF8",
                  },
                ]}
              >
                {c.nombre}
              </Text>
              <Text style={styles.accountBalance}>
                Disp: ${parseFloat(c.saldo_actual).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de Acción */}
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
  container: { flex: 1, backgroundColor: "#0F172A", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 20,
  },
  closeBtn: { padding: 8, backgroundColor: "#1E293B", borderRadius: 12 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },

  deudaSummary: { alignItems: "center", marginVertical: 20 },
  labelCenter: {
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
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
  deudaName: { color: "white", fontWeight: "700" },
  pendingText: { color: "#94A3B8", fontSize: 13 },

  amountSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  currencySymbol: {
    fontSize: 45,
    color: "white",
    fontWeight: "bold",
    marginRight: 10,
  },
  amountInput: {
    fontSize: 55,
    color: "white",
    fontWeight: "bold",
    width: "80%",
    textAlign: "center",
  },

  label: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  selectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  accountCard: {
    padding: 16,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    width: "48%",
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountName: { color: "white", fontSize: 15, fontWeight: "600" },
  accountBalance: { color: "#64748B", fontSize: 12, marginTop: 4 },

  confirmBtn: {
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  confirmBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
