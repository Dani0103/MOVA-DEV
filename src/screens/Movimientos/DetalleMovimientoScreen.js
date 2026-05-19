import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { editMovimiento, deleteMovimiento } from "../../services/MovimientosService";
import { universalAlert } from "../../utils/universalAlert";
import DatePickerInput from "../../components/ui/DatePickerInput";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay, formatMoneyNumber } from "../../utils/moneyFormatter";

function tipoColor(tipo) {
  if (tipo === "ingreso") return "#4ADE80";
  if (tipo === "transferencia") return "#38BDF8";
  return "#F87171"; // gasto / prestamo
}

function tipoLabel(tipo) {
  const labels = {
    ingreso: "Ingreso",
    gasto: "Gasto",
    transferencia: "Transferencia",
    prestamo: "Préstamo",
  };
  return labels[tipo] || tipo;
}

function formatFecha(fechaString) {
  if (!fechaString) return "Fecha desconocida";
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DetalleMovimientoScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = useAuth();

  // route.params.movimiento puede llegar después si la pantalla ya estaba montada
  // (React Navigation reutiliza el componente sin desmontar si ya está en el stack)
  const { movimiento: initialMovimiento } = route.params ?? {};
  const [movimiento, setMovimiento] = useState(initialMovimiento ?? {});

  const [editVisible, setEditVisible] = useState(false);
  const [descripcion, setDescripcion] = useState(initialMovimiento?.descripcion || "");
  const [monto, setMonto] = useState(formatMoneyNumber(initialMovimiento?.monto, user?.moneda));
  const [fecha, setFecha] = useState(
    initialMovimiento?.fecha
      ? initialMovimiento.fecha.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );

  // Sincronizar estado local cuando lleguen params nuevos.
  // Ocurre cuando la pantalla ya estaba en el stack (React Navigation reutiliza el
  // componente sin desmontar) y se navega a ella con otro movimiento.
  // Usamos `_ts` como dependencia extra para que también se dispare cuando se
  // navega al MISMO movimiento desde HomeScreen (p.ej. después de editar).
  useEffect(() => {
    const mov = route.params?.movimiento;
    if (!mov) return;
    setMovimiento(mov);
    setDescripcion(mov.descripcion || "");
    setMonto(formatMoneyNumber(mov.monto, user?.moneda));
    setFecha(mov.fecha ? mov.fecha.split("T")[0] : new Date().toISOString().split("T")[0]);
  }, [route.params?.movimiento?.id, route.params?._ts]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const accentColor = tipoColor(movimiento.tipo);

  const handleEliminar = () => {
    universalAlert(
      "Eliminar Movimiento",
      `¿Estás seguro de que quieres eliminar este movimiento? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteMovimiento(movimiento.id, token);
              navigation.goBack();
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo eliminar el movimiento.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleGuardar = async () => {
    const montoNum = parseMoneyDisplay(monto, user?.moneda);
    if (isNaN(montoNum) || montoNum <= 0) {
      universalAlert("Error", "El monto debe ser un número mayor a 0.");
      return;
    }
    try {
      setSaving(true);
      const updated = await editMovimiento(
        movimiento.id,
        {
          descripcion: descripcion.trim(),
          monto: montoNum,
          fecha,
          categoria_id: movimiento.categoria_id,
        },
        token
      );
      const newData = updated?.data || updated;
      setMovimiento((prev) => ({
        ...prev,
        descripcion: newData?.descripcion ?? descripcion.trim(),
        monto: newData?.monto ?? montoNum,
        fecha: newData?.fecha ?? fecha,
      }));
      setEditVisible(false);
      universalAlert("¡Éxito!", "Movimiento actualizado correctamente.");
    } catch (e) {
      universalAlert("Error", e.message || "No se pudo actualizar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setDescripcion(movimiento.descripcion || "");
    setMonto(formatMoneyNumber(movimiento.monto, user?.moneda));
    setFecha(
      movimiento.fecha
        ? movimiento.fecha.split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setEditVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle</Text>
        <View style={styles.headerActions}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <TouchableOpacity
                onPress={openEdit}
                style={[styles.iconBtn, { backgroundColor: theme.card }]}
              >
                <Ionicons name="pencil-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEliminar}
                style={[styles.iconBtn, { backgroundColor: theme.card }]}
              >
                <Ionicons name="trash-outline" size={18} color="#F87171" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Big Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.bigAmount, { color: accentColor }]}>
            {movimiento.tipo === "ingreso" ? "+" : "-"} ${" "}
            {Number(movimiento.monto || 0).toLocaleString()}
          </Text>
          <View style={[styles.tipoBadge, { backgroundColor: accentColor + "20" }]}>
            <Text style={[styles.tipoLabel, { color: accentColor }]}>
              {tipoLabel(movimiento.tipo)}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color={theme.textMuted} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Descripción</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {movimiento.descripcion || "Sin descripción"}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color={theme.textMuted} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Categoría</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {movimiento.categoria?.nombre || "Sin categoría"}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Fecha</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {formatFecha(movimiento.fecha || movimiento.creado_en)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <Ionicons name="swap-horizontal-outline" size={18} color={theme.textMuted} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Tipo</Text>
              <View style={[styles.tipoBadgeSmall, { backgroundColor: accentColor + "20" }]}>
                <Text style={[styles.tipoLabelSmall, { color: accentColor }]}>
                  {tipoLabel(movimiento.tipo)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Movimiento</Text>

            {/* Descripción */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Descripción</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholderTextColor={theme.placeholder}
              placeholder="Descripción del movimiento"
              value={descripcion}
              onChangeText={setDescripcion}
            />

            {/* Monto */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Monto</Text>
            <MoneyInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              placeholderTextColor={theme.placeholder}
              placeholder="0.00"
              value={monto}
              onChangeText={setMonto}
            />

            {/* Fecha */}
            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Fecha</Text>
            <DatePickerInput value={fecha} onChange={setFecha} />

            {/* Buttons */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalSecondaryBtn, { backgroundColor: theme.background }]}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text style={[styles.modalSecondaryText, { color: theme.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
                onPress={handleGuardar}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.modalPrimaryText, { color: theme.background }]}>
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  amountSection: {
    alignItems: "center",
    marginVertical: 28,
    gap: 12,
  },
  bigAmount: {
    fontSize: 40,
    fontWeight: "bold",
  },
  tipoBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tipoLabel: {
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoCard: {
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  tipoBadgeSmall: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  tipoLabelSmall: {
    fontWeight: "600",
    fontSize: 13,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  modalSecondaryBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSecondaryText: {
    fontWeight: "600",
    fontSize: 15,
  },
  modalPrimaryBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  modalPrimaryText: {
    fontWeight: "bold",
    fontSize: 15,
  },
});
