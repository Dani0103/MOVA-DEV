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
import { createAporte } from "../../services/MetasService";
import { useTheme } from "../../theme/useTheme";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay } from "../../utils/moneyFormatter";

export default function AddAhorroScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { meta } = route.params; // La meta a la que le sumaremos dinero
  const { token, user } = useAuth();
  const { cuentas } = useAccounts();

  const [monto, setMonto] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!monto || parseMoneyDisplay(monto, user?.moneda) <= 0) {
      universalAlert("Error", "Ingresa un monto válido para ahorrar.");
      return;
    }
    if (!cuentaSeleccionada) {
      universalAlert("Error", "Selecciona una cuenta de origen.");
      return;
    }

    try {
      setSubmitting(true);
      await createAporte(token, meta.id, { monto: parseMoneyDisplay(monto, user?.moneda) });
      universalAlert(
        "¡Ahorro registrado!",
        `Has sumado $${parseMoneyDisplay(monto, user?.moneda).toLocaleString()} a tu meta: ${meta.nombre}`,
        [{ text: "Genial", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      universalAlert("Error", error.message || "No se pudo procesar el ahorro.");
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nuevo Aporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info de la Meta */}
        <View style={styles.metaSummary}>
          <Text style={[styles.labelCenter, { color: theme.textMuted }]}>Destino</Text>
          <View style={[styles.metaBadge, { borderColor: meta.color }]}>
            <Ionicons name={meta.icono} size={20} color={meta.color} />
            <Text style={[styles.metaName, { color: theme.text }]}>{meta.nombre}</Text>
          </View>
        </View>

        {/* Input de Monto */}
        <View style={styles.amountContainer}>
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

        {/* Selector de Cuenta de Origen */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>¿De qué cuenta sale el dinero?</Text>
        <View style={styles.selectorContainer}>
          {cuentas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.selectorButton,
                { backgroundColor: theme.card },
                cuentaSeleccionada?.id === c.id && {
                  backgroundColor: (c.color_hex || theme.primary) + "20",
                  borderColor: c.color_hex || theme.primary,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setCuentaSeleccionada(c)}
            >
              <Text
                style={[
                  styles.selectorText,
                  { color: theme.textSecondary },
                  cuentaSeleccionada?.id === c.id && {
                    color: c.color_hex || theme.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                {c.nombre}
              </Text>
              <Text style={[styles.accountBalance, { color: theme.textMuted }]}>
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
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.saveBtnText, { color: theme.background }]}>Confirmar Ahorro</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  closeBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  metaSummary: { alignItems: "center", marginBottom: 30 },
  labelCenter: {
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
  metaName: { fontWeight: "700" },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: "bold",
    marginRight: 10,
  },
  amountInput: {
    fontSize: 50,
    fontWeight: "bold",
    width: "80%",
    textAlign: "center",
  },
  label: {
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
    borderRadius: 16,
    minWidth: "47%",
    alignItems: "center",
  },
  selectorText: { fontSize: 14, fontWeight: "600" },
  accountBalance: { fontSize: 11, marginTop: 4 },
  saveBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  saveBtnText: { fontWeight: "bold", fontSize: 16 },
});
