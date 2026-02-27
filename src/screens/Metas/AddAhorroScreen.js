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

export default function AddAhorroScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { meta } = route.params; // La meta a la que le sumaremos dinero
  const { cuentas, refreshAccounts } = useAccounts(); // Traemos las cuentas para elegir de dónde sale el dinero

  const [monto, setMonto] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      universalAlert("Error", "Ingresa un monto válido para ahorrar.");
      return;
    }
    if (!cuentaSeleccionada) {
      universalAlert("Error", "Selecciona una cuenta de origen.");
      return;
    }

    try {
      setSubmitting(true);

      // Aquí iría tu lógica de API:
      // 1. Crear un movimiento de tipo 'gasto' o 'transferencia' en la cuenta de origen.
      // 2. Actualizar el saldo 'actual' de la meta en la DB.

      console.log(
        `Ahorrando $${monto} en ${meta.nombre} desde ${cuentaSeleccionada.nombre}`,
      );

      universalAlert(
        "¡Ahorro registrado!",
        `Has sumado dinero a tu meta: ${meta.nombre}`,
        [{ text: "Genial", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      universalAlert("Error", "No se pudo procesar el ahorro.");
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
        <Text style={styles.headerTitle}>Nuevo Aporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info de la Meta */}
        <View style={styles.metaSummary}>
          <Text style={styles.labelCenter}>Destino</Text>
          <View style={[styles.metaBadge, { borderColor: meta.color }]}>
            <Ionicons name={meta.icono} size={20} color={meta.color} />
            <Text style={styles.metaName}>{meta.nombre}</Text>
          </View>
        </View>

        {/* Input de Monto */}
        <View style={styles.amountContainer}>
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

        {/* Selector de Cuenta de Origen */}
        <Text style={styles.label}>¿De qué cuenta sale el dinero?</Text>
        <View style={styles.selectorContainer}>
          {cuentas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.selectorButton,
                cuentaSeleccionada?.id === c.id && {
                  backgroundColor: (c.color_hex || "#38BDF8") + "20",
                  borderColor: c.color_hex || "#38BDF8",
                  borderWidth: 1,
                },
              ]}
              onPress={() => setCuentaSeleccionada(c)}
            >
              <Text
                style={[
                  styles.selectorText,
                  cuentaSeleccionada?.id === c.id && {
                    color: c.color_hex || "#38BDF8",
                    fontWeight: "bold",
                  },
                ]}
              >
                {c.nombre}
              </Text>
              <Text style={styles.accountBalance}>
                Saldo: ${parseFloat(c.saldo_actual).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: meta.color }]}
          onPress={handleGuardar}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.saveBtnText}>Confirmar Ahorro</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  closeBtn: { padding: 8, backgroundColor: "#1E293B", borderRadius: 12 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  metaSummary: { alignItems: "center", marginBottom: 30 },
  labelCenter: {
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  metaName: { color: "white", fontWeight: "700" },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  currencySymbol: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
    marginRight: 10,
  },
  amountInput: {
    fontSize: 50,
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
  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  selectorButton: {
    padding: 15,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    minWidth: "47%",
    alignItems: "center",
  },
  selectorText: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  accountBalance: { color: "#64748B", fontSize: 11, marginTop: 4 },
  saveBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  saveBtnText: { color: "#0F172A", fontWeight: "bold", fontSize: 16 },
});
