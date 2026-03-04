import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";
import { createMovimiento } from "../../services/MovimientosService";
import { useAuth } from "../../context/AuthContext";
import { universalAlert } from "../../utils/universalAlert";

// Supongamos que recibes 'categorias' y 'setCateogrias' como props igual que las cuentas
export default function CrearMovimientoScreen({
  navigation,
  movimientos,
  setMovimientos,
  cuentas,
  setCuentas,
  categorias = [], // Añadido para validación
}) {
  const { token } = useAuth();

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!descripcion.trim()) return setError("La descripción es obligatoria");
    if (!monto || parseFloat(monto) <= 0)
      return setError("Ingresa un monto válido");
    if (!categoriaSeleccionada) return setError("Selecciona una categoría");
    if (!cuentaSeleccionada) return setError("Selecciona una cuenta");

    setError("");
    const montoNum = parseFloat(monto);

    const dataToSend = {
      // Si es gasto, sale de origen. Si es ingreso, entra a destino.
      cuenta_origen_id: tipo === "gasto" ? cuentaSeleccionada.id : null,
      cuenta_destino_id: tipo === "ingreso" ? cuentaSeleccionada.id : null,
      categoria_id: categoriaSeleccionada.id,
      monto: montoNum,
      tipo: tipo, // "gasto" o "ingreso"
      estado: "completada",
      tasa_cambio: 1,
      monto_convertido: montoNum,
      fecha: new Date().toISOString().split("T")[0], // "2026-03-04"
      descripcion: descripcion.trim(),
      notas_internas: "",
      etiqueta_ids: [], // Si no manejas etiquetas, envíalo vacío
    };

    try {
      setSubmitting(true);

      const response = await createMovimiento(dataToSend, token);
      const mensajeExito = response?.message || "Movimiento guardado con éxito";

      universalAlert("¡Completado!", mensajeExito, [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      const mensajeError =
        err.response?.data?.message || err.message || "No se pudo guardar";
      universalAlert("Error", mensajeError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nuevo Movimiento</Text>

        {error ? (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* MONTO */}
        <View style={styles.montoContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            placeholder="0"
            placeholderTextColor="#475569"
            keyboardType="numeric"
            style={styles.montoInput}
            value={monto}
            onChangeText={(v) => {
              setMonto(v);
              setError("");
            }}
          />
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          placeholder="Ej. Cena con amigos"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={descripcion}
          onChangeText={(v) => {
            setDescripcion(v);
            setError("");
          }}
        />

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.selectorContainer}>
          {TRANSACTION_TYPES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.selectorButton,
                tipo === item.id && {
                  borderColor: item.color,
                  backgroundColor: item.color + "15",
                },
              ]}
              onPress={() => setTipo(item.id)}
            >
              <Text
                style={[
                  styles.selectorText,
                  tipo === item.id && { color: item.color },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* VALIDACIÓN CATEGORÍAS */}
        <Text style={styles.label}>Categoría</Text>
        {!categorias || categorias.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tienes categorías creadas</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate("Categorias")}
            >
              <Text style={styles.createBtnText}>Configurar Categorías</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectorContainer}>
            {/* Filtramos por tipo para mostrar solo las relevantes */}
            {categorias
              .filter((c) => c.tipo === tipo)
              .map((cat) => {
                const isSelected = categoriaSeleccionada?.id === cat.id;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      isSelected && {
                        backgroundColor: cat.color_hex + "20", // Fondo suave (20% opacidad)
                        borderColor: cat.color_hex, // Borde del color de la categoría
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => {
                      setCategoriaSeleccionada(cat);
                      setError("");
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && {
                          color: cat.color_hex,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}

        {/* VALIDACIÓN CUENTAS */}
        <Text style={styles.label}>Cuenta</Text>
        {!cuentas || cuentas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Necesitas una cuenta para operar
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate("Cuentas")}
            >
              <Text style={styles.createBtnText}>Crear mi primera cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectorContainer}>
            {cuentas.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  cuentaSeleccionada?.id === c.id && styles.chipActive,
                ]}
                onPress={() => {
                  setCuentaSeleccionada(c);
                  setError("");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    cuentaSeleccionada?.id === c.id && styles.chipTextActive,
                  ]}
                >
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.secondaryText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            (submitting || !cuentas?.length || !categorias?.length) && {
              opacity: 0.5,
            },
          ]}
          onPress={handleGuardar}
          disabled={submitting || !cuentas?.length || !categorias?.length}
        >
          {submitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.buttonText}>Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (tus estilos anteriores se mantienen)
  container: { flex: 1, padding: 20 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    color: "white",
    fontSize: 16,
  },

  montoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  currencySymbol: {
    color: "#38BDF8",
    fontSize: 40,
    fontWeight: "bold",
    marginRight: 10,
  },
  montoInput: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
    minWidth: 100,
  },

  selectorContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectorText: { color: "#94A3B8", fontWeight: "bold" },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    marginBottom: 5,
  },
  chipActive: { backgroundColor: "#38BDF8" },
  chipText: { color: "#94A3B8", fontWeight: "500" },
  chipTextActive: { color: "#0F172A", fontWeight: "bold" },

  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#1E293B",
    gap: 10,
  },
  button: {
    flex: 2,
    backgroundColor: "#38BDF8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "bold", color: "#0F172A", fontSize: 16 },
  secondaryButton: { flex: 1, padding: 16, alignItems: "center" },
  secondaryText: { color: "#94A3B8", fontWeight: "600" },

  // ESTILOS DE ESTADO VACÍO
  emptyCard: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#38BDF8",
  },
  emptyText: { color: "#94A3B8", marginBottom: 10, fontSize: 13 },
  createBtn: {
    backgroundColor: "#38BDF820",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  createBtnText: { color: "#38BDF8", fontWeight: "bold", fontSize: 12 },

  errorBadge: {
    backgroundColor: "#EF444420",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: { color: "#F87171", fontSize: 13, fontWeight: "500" },
});
