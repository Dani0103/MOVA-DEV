import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";
import { createMovimiento } from "../../services/MovimientosService";
import { TypeMovement } from "../../services/CatalogoService";
import { useAuth } from "../../context/AuthContext";
import { universalAlert } from "../../utils/universalAlert";

export default function QuickMovementModal({
  visible,
  onClose,
  cuentas = [],
  categorias = [],
  onSuccess,
}) {
  const { token } = useAuth();

  // Estados del Formulario
  const [step, setStep] = useState(1);
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto"); // Por defecto gasto
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [descripcion, setDescripcion] = useState("");

  // Estados de Carga
  const [tiposMovimientos, setTiposMovimientos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      traerTipoMovimiento();
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setStep(1);
    setMonto("");
    setTipo("gasto");
    setCategoriaSeleccionada(null);
    setCuentaSeleccionada(null);
    setDescripcion("");
  };

  const traerTipoMovimiento = async () => {
    try {
      const response = await TypeMovement();
      if (response?.data?.tipo_movimiento) {
        const types = response.data.tipo_movimiento.map(
          (t) =>
            TRANSACTION_TYPES.find((tt) => tt.id === t) || {
              id: t,
              label: t,
              color: "#94A3B8",
            },
        );
        setTiposMovimientos(types);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Función para el formateo visual (Mantiene el estado con comas)
  const handleMontoChange = (text) => {
    // 1. Quitamos todo lo que no sea número o punto
    let rawValue = text.replace(/[^0-9.]/g, "");

    // 2. Evitamos múltiples puntos decimales
    const parts = rawValue.split(".");
    if (parts.length > 2) {
      rawValue = parts[0] + "." + parts.slice(1).join("");
    }

    // 3. Separamos parte entera de decimal
    const [integerPart, decimalPart] = rawValue.split(".");

    // 4. Formateamos la parte entera con comas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // 5. Recomponemos: si hay punto, lo mantenemos; si hay decimales, también.
    const finalValue =
      decimalPart !== undefined
        ? `${formattedInteger}.${decimalPart}`
        : rawValue.includes(".")
          ? `${formattedInteger}.`
          : formattedInteger;

    setMonto(finalValue);
  };

  const handleFinish = async () => {
    setSubmitting(true);

    // 1. QUITAMOS LAS COMAS: "1,250.50" -> "1250.50"
    const montoSinComas = monto.replace(/,/g, "");
    const montoNum = parseFloat(montoSinComas);

    // Validación de seguridad
    if (isNaN(montoNum) || montoNum <= 0) {
      universalAlert("Error", "Por favor ingresa un monto válido.");
      setSubmitting(false);
      return;
    }

    const dataToSend = {
      cuenta_origen_id: tipo === "gasto" ? cuentaSeleccionada?.id : null,
      cuenta_destino_id: tipo === "ingreso" ? cuentaSeleccionada?.id : null,
      categoria_id: categoriaSeleccionada?.id,
      monto: montoNum, // <--- Aquí ya va el número limpio
      tipo: tipo,
      estado: "completada",
      fecha: new Date().toISOString().split("T")[0],
      descripcion: descripcion.trim() || categoriaSeleccionada?.nombre,
    };

    try {
      await createMovimiento(dataToSend, token);
      if (onSuccess) await onSuccess();
      onClose();
      universalAlert("¡Éxito!", "Movimiento registrado");
    } catch (err) {
      universalAlert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            step >= s ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );

  const obtenerTitulo = () => {
    switch (step) {
      case 1:
        return "Monto del movimiento";
      case 2:
        return "Categoría y Tipo";
      case 3:
        return "Detalles finales";
      default:
        return "Nuevo Movimiento";
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Título dinámico según el paso */}
            <Text style={styles.modalTitle}>{obtenerTitulo()}</Text>

            {renderStepIndicator()}
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody}>
            {/* PASO 1: MONTO */}
            {step === 1 && (
              <View style={styles.stepView}>
                <Text style={styles.stepLabel}>¿Cuánto dinero?</Text>
                <View style={styles.montoBigContainer}>
                  <Text style={styles.montoSymbol}>$</Text>
                  <TextInput
                    autoFocus
                    placeholder="0"
                    placeholderTextColor="#334155"
                    keyboardType="decimal-pad"
                    style={styles.hugeInput}
                    value={monto}
                    onChangeText={handleMontoChange}
                    // 🔹 Propiedades para evitar el desborde:
                    adjustsFontSizeToFit={true} // Reduce el tamaño si no cabe
                    minimumFontScale={0.5} // El tamaño mínimo será el 50% del original
                    numberOfLines={1} // Obliga a que no salte de línea
                  />
                </View>
              </View>
            )}

            {/* PASO 2: TIPO Y CATEGORÍA */}
            {step === 2 && (
              <View style={styles.stepView}>
                <Text style={styles.stepLabel}>Tipo y Categoría</Text>
                <View style={styles.typeToggle}>
                  {tiposMovimientos.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => {
                        setTipo(t.id);
                        setCategoriaSeleccionada(null);
                      }}
                      style={[
                        styles.typeBtn,
                        tipo === t.id && { backgroundColor: t.color },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBtnText,
                          tipo === t.id && { color: "#0F172A" },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.gridContainer}>
                  {categorias
                    .filter((c) => c.tipo === tipo)
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoriaSeleccionada(cat)}
                        style={[
                          styles.catCard,
                          categoriaSeleccionada?.id === cat.id && {
                            borderColor: cat.color_hex,
                            backgroundColor: cat.color_hex + "20",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.miniIcon,
                            { backgroundColor: cat.color_hex },
                          ]}
                        />
                        <Text style={styles.catName} numberOfLines={1}>
                          {cat.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {/* PASO 3: CUENTA Y NOTA */}
            {step === 3 && (
              <View style={styles.stepView}>
                <Text style={styles.stepLabel}>¿De dónde sale/entra?</Text>
                <View style={styles.accountList}>
                  {cuentas.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setCuentaSeleccionada(acc)}
                      style={[
                        styles.accItem,
                        cuentaSeleccionada?.id === acc.id && {
                          borderColor: acc.color_hex,
                        },
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={20}
                        color={acc.color_hex}
                      />
                      <Text style={styles.accName}>{acc.nombre}</Text>
                      {cuentaSeleccionada?.id === acc.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={acc.color_hex}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.stepLabel, { marginTop: 20 }]}>
                  Descripción (Opcional)
                </Text>
                <TextInput
                  placeholder="Nota rápida..."
                  placeholderTextColor="#64748B"
                  style={styles.simpleInput}
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Navigation */}
          <View style={styles.modalFooter}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backBtnText}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextBtn,
                (!monto ||
                  (step === 2 && !categoriaSeleccionada) ||
                  (step === 3 && !cuentaSeleccionada)) &&
                  styles.disabledBtn,
              ]}
              onPress={() => {
                if (step < 3) setStep(step + 1);
                else handleFinish();
              }}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.nextBtnText}>
                  {step === 3 ? "Finalizar" : "Siguiente"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  modalTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scrollBody: { padding: 20 },
  stepIndicatorContainer: { flexDirection: "row", gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepDotActive: { backgroundColor: "#38BDF8", width: 8 },
  stepDotInactive: { backgroundColor: "#334155" },
  stepView: { width: "100%" },
  stepLabel: {
    color: "#94A3B8",
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "600",
  },
  montoBigContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Empuja todo a la derecha
    marginTop: 40,
    backgroundColor: "#1E293B", // Fondo sutil para el área del input
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  montoSymbol: {
    color: "#38BDF8",
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 10,
  },
  hugeInput: {
    color: "white",
    fontSize: 42, // Reducido un poco para que quepan cifras grandes
    fontWeight: "bold",
    textAlign: "right", // Pegado a la derecha
    flex: 1, // Toma todo el espacio disponible
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  typeBtnText: { color: "#94A3B8", fontWeight: "bold" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: {
    width: "31%",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  miniIcon: { width: 10, height: 10, borderRadius: 5, marginBottom: 8 },
  catName: { color: "white", fontSize: 12 },
  accountList: { gap: 10 },
  accItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 12,
  },
  accName: { color: "white", flex: 1, fontWeight: "500" },
  simpleInput: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    color: "white",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  nextBtn: {
    flex: 2,
    backgroundColor: "#38BDF8",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  nextBtnText: { color: "#0F172A", fontWeight: "bold", fontSize: 16 },
  backBtn: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtnText: { color: "#94A3B8", fontWeight: "600" },
  disabledBtn: { opacity: 0.3 },
});
