import React, { useEffect, useState } from "react";
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
import { TypeMovement } from "../../services/CatalogoService";
import { useTheme } from "../../theme/useTheme";
import DatePickerInput from "../../components/ui/DatePickerInput";
import MoneyInput from "../../components/ui/MoneyInput";
import { parseMoneyDisplay } from "../../utils/moneyFormatter";

// Supongamos que recibes 'categorias' y 'setCateogrias' como props igual que las cuentas
export default function CrearMovimientoScreen({
  navigation,
  movimientos,
  setMovimientos,
  cuentas,
  setCuentas,
  categorias = [], // Añadido para validación
  onSuccess,
}) {
  const theme = useTheme();
  const { token, user } = useAuth();

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [tiposMovimientos, setTiposMovimientos] = useState([]);

  const handleGuardar = async () => {
    if (!descripcion.trim()) return setError("La descripción es obligatoria");
    if (!monto || parseMoneyDisplay(monto, user?.moneda) <= 0)
      return setError("Ingresa un monto válido");
    if (!categoriaSeleccionada) return setError("Selecciona una categoría");
    if (!cuentaSeleccionada) return setError("Selecciona una cuenta");

    setError("");
    const montoNum = parseMoneyDisplay(monto, user?.moneda);

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
      fecha,
      descripcion: descripcion.trim(),
      notas_internas: "",
      etiqueta_ids: [], // Si no manejas etiquetas, envíalo vacío
    };

    try {
      setSubmitting(true);

      const response = await createMovimiento(dataToSend, token);
      const mensajeExito = response?.message || "Movimiento guardado con éxito";

      if (typeof onSuccess === "function") {
        await onSuccess();
      }

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

  const traerTipoMovimiento = async () => {
    try {
      const response = await TypeMovement();

      // Verificamos si la data viene correctamente
      if (response?.data?.tipo_movimiento) {
        const tiposFormateados = response.data.tipo_movimiento.map(
          (tipoString) => {
            // Buscamos el tipo en tu diccionario TRANSACTION_TYPES
            const tipoEncontrado = TRANSACTION_TYPES.find(
              (t) => t.id === tipoString,
            );

            // Si lo encuentra, lo usamos. Si no, creamos uno genérico por defecto
            return (
              tipoEncontrado || {
                id: tipoString,
                label: tipoString.charAt(0).toUpperCase() + tipoString.slice(1), // Capitaliza la primera letra
                icon: "help-circle",
                color: "#94A3B8",
              }
            );
          },
        );

        setTiposMovimientos(tiposFormateados);
      } else {
        setTiposMovimientos([]);
      }
    } catch (err) {
      console.error("Error al cargar los tipos de movimiento:", err);
      setTiposMovimientos([]); // Forzamos el array vacío para mostrar el mensaje de error
    }
  };

  useEffect(() => {
    traerTipoMovimiento();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Nuevo Movimiento</Text>

        {error ? (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* MONTO */}
        <View style={styles.montoContainer}>
          <Text style={[styles.currencySymbol, { color: theme.primary }]}>$</Text>
          <MoneyInput
            placeholder="0"
            placeholderTextColor="#475569"
            style={[styles.montoInput, { color: theme.text, borderColor: theme.border }]}
            value={monto}
            onChangeText={(v) => {
              setMonto(v);
              setError("");
            }}
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de movimiento</Text>

        {tiposMovimientos.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No se pudieron cargar los tipos de movimiento.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => traerTipoMovimiento()}
            >
              <Text style={styles.createBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectorContainer}>
            {tiposMovimientos.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.selectorButton,
                  { backgroundColor: theme.card },
                  tipo === item.id && {
                    borderColor: item.color,
                    backgroundColor: item.color + "15",
                  },
                ]}
                onPress={() => {
                  setTipo(item.id);
                  setCategoriaSeleccionada(null);
                }}
              >
                <Text
                  style={[
                    styles.selectorText,
                    { color: theme.textSecondary },
                    tipo === item.id && { color: item.color },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* VALIDACIÓN CATEGORÍAS */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
        {(() => {
          // 1. Validamos primero si ya se seleccionó un tipo de movimiento
          if (!tipo) {
            return (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.card, borderStyle: "solid", borderColor: theme.border },
                ]}
              >
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Selecciona primero un tipo de movimiento para ver las
                  categorías.
                </Text>
              </View>
            );
          }

          // 2. Filtramos las categorías por el tipo seleccionado (solo activas)
          const categoriasPorTipo = categorias.filter((c) => c.tipo === tipo && c.activa !== false);

          // 3. Si se seleccionó tipo pero no hay categorías creadas para ese tipo
          if (categoriasPorTipo.length === 0) {
            return (
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No tienes categorías de tipo "
                  {TRANSACTION_TYPES.find((t) => t.id === tipo)?.label}"
                </Text>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => navigation.navigate("Categorias")}
                >
                  <Text style={styles.createBtnText}>
                    Configurar Categorías
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

          // 4. Si existen, las mostramos
          return (
            <View style={styles.selectorContainer}>
              {categoriasPorTipo.map((cat) => {
                const isSelected = categoriaSeleccionada?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.card },
                      isSelected && {
                        backgroundColor: cat.color_hex + "20",
                        borderColor: cat.color_hex,
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
                        { color: theme.textSecondary },
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
          );
        })()}

        {/* VALIDACIÓN CUENTAS */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Cuenta</Text>
        {!cuentas || cuentas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
                  { backgroundColor: theme.card },
                  cuentaSeleccionada?.id === c.id && { backgroundColor: theme.primary },
                ]}
                onPress={() => {
                  setCuentaSeleccionada(c);
                  setError("");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.textSecondary },
                    cuentaSeleccionada?.id === c.id && { color: theme.background, fontWeight: "bold" },
                  ]}
                >
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Fecha</Text>
        <DatePickerInput value={fecha} onChange={setFecha} />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
        <TextInput
          placeholder="Ej. Cena con amigos"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
          value={descripcion}
          onChangeText={(v) => {
            setDescripcion(v);
            setError("");
          }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.primary },
            (submitting || !cuentas?.length || !categorias?.length) && {
              opacity: 0.5,
            },
          ]}
          onPress={handleGuardar}
          disabled={submitting || !cuentas?.length || !categorias?.length}
        >
          {submitting ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (tus estilos anteriores se mantienen)
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },

  montoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: "bold",
    marginRight: 10,
  },
  montoInput: {
    fontSize: 48,
    fontWeight: "bold",
    minWidth: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: "center",
  },

  selectorContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectorText: { fontWeight: "bold" },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 5,
  },
  chipText: { fontWeight: "500" },

  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 16 },
  secondaryButton: { flex: 1, padding: 16, alignItems: "center" },
  secondaryText: { fontWeight: "600" },

  // ESTILOS DE ESTADO VACÍO
  emptyCard: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: { marginBottom: 10, fontSize: 13 },
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
