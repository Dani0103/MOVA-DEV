import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createAccount, updateAccount } from "../../services/CuentaService";
import { TypeAccount, TypeCurrency } from "../../services/CatalogoService";
import { useAuth } from "../../context/AuthContext";
import { universalAlert } from "../../utils/universalAlert";
import FormSelect from "../../components/form/FormSelect";

export default function CrearCuentaScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // <-- Añadido para recibir parámetros
  const { user, token } = useAuth();

  // Verificamos si recibimos una cuenta para editar
  const cuentaAEditar = route.params?.cuenta;
  const esEdicion = !!cuentaAEditar;

  const COLORES_DISPONIBLES = [
    "#38BDF8",
    "#4ADE80",
    "#F87171",
    "#FB923C",
    "#A78BFA",
    "#F472B6",
    "#10B981",
    "#64748B",
  ];

  // Inicializamos los estados con los datos de la cuenta si estamos editando
  const [nombre, setNombre] = useState(cuentaAEditar?.nombre || "");
  const [saldo, setSaldo] = useState(
    cuentaAEditar?.saldo_actual?.toString() || "",
  );
  const [tipoId, setTipoId] = useState(cuentaAEditar?.tipo_cuenta?.id || null);
  const [monedaId, setMonedaId] = useState(cuentaAEditar?.moneda?.id || null);
  const [colorHex, setColorHex] = useState(
    cuentaAEditar?.color_hex || "#38BDF8",
  );

  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [tiposMoneda, setTiposMoneda] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 1. Cargar tipos de cuenta desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const dataCuentas = await TypeAccount(token);
        const dataMonedas = await TypeCurrency(token);

        setTiposCuenta(dataCuentas.data);
        setTiposMoneda(dataMonedas.data);

        // Lógica de selección automática
        if (!esEdicion) {
          // 1. Buscamos en la lista de la API la moneda que coincida con el código del usuario
          const monedaPreferida = dataMonedas.data?.find(
            (m) => m.codigo === user?.moneda,
          );

          if (monedaPreferida) {
            // 2. Si la encuentra, seteamos su ID
            setMonedaId(monedaPreferida.id);
          } else if (dataMonedas.data?.length > 0) {
            // 3. Fallback: si no hay coincidencia, seleccionamos la primera de la lista
            setMonedaId(dataMonedas.data[0].id);
          }
        }
      } catch (err) {
        universalAlert("Error", "No se pudieron cargar los catálogos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGuardar = async () => {
    if (!nombre || !saldo || !tipoId || !monedaId) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setSubmitting(true);

      const dataToSend = {
        tipo_cuenta_id: tipoId,
        moneda_id: monedaId,
        nombre: nombre,
        saldo_actual: parseFloat(saldo),
        color_hex: colorHex,
      };

      if (esEdicion) {
        // Llamada a la API para actualizar
        await updateAccount(cuentaAEditar.nombre, dataToSend, token);
        universalAlert(
          "¡Actualizado!",
          "Los cambios se guardaron correctamente.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      } else {
        // Llamada a la API para crear
        await createAccount(dataToSend, token);
        universalAlert(
          "¡Excelente!",
          "Tu cuenta ha sido creada correctamente.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      }
    } catch (err) {
      universalAlert(
        "Error al guardar",
        err.message || "No se pudo conectar con el servidor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = () => {
    if (nombre || saldo) {
      universalAlert(
        "¿Descartar cambios?",
        "Si sales ahora, perderás la información ingresada.",
        [
          { text: "Continuar editando", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        {/* Título dinámico */}
        <Text style={styles.title}>
          {esEdicion ? "Editar Cuenta" : "Nueva Cuenta"}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Nombre de la cuenta *</Text>
      <TextInput
        placeholder="Ej: Efectivo o Banco"
        placeholderTextColor="#64748B"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        disabled={esEdicion}
      />

      <Text style={styles.label}>Moneda *</Text>
      <FormSelect
        placeholder="Selecciona una moneda"
        loading={loading}
        value={monedaId}
        onValueChange={(value) => setMonedaId(value)}
        items={tiposMoneda.map((m) => ({
          code: m.id,
          label: `${m.codigo} - ${m.nombre || "Moneda"}`,
        }))}
      />

      <Text style={styles.label}>Tipo de cuenta *</Text>
      <View style={styles.tipoContainer}>
        {loading
          ? [1, 2, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.tipoButton,
                  styles.loaderPlaceholder,
                  { width: 80 },
                ]}
              >
                <ActivityIndicator size="small" color="#38BDF8" />
              </View>
            ))
          : tiposCuenta.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.tipoButton,
                  tipoId === item.id && styles.tipoActive,
                ]}
                onPress={() => setTipoId(item.id)}
              >
                <Text
                  style={[
                    styles.tipoText,
                    tipoId === item.id && styles.tipoTextActive,
                  ]}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            ))}
      </View>

      {/* Label dinámico para el saldo */}
      <Text style={styles.label}>
        {esEdicion ? "Saldo Actual *" : "Saldo Inicial *"}
      </Text>
      <TextInput
        placeholder="0.00"
        placeholderTextColor="#64748B"
        style={styles.input}
        keyboardType="decimal-pad"
        value={saldo}
        onChangeText={(text) => {
          const cleanNumber = text.replace(/[^0-9.]/g, "");
          if ((cleanNumber.match(/\./g) || []).length <= 1) {
            setSaldo(cleanNumber);
          }
        }}
      />

      <Text style={styles.label}>Color Identificador *</Text>
      <View style={styles.colorContainer}>
        {COLORES_DISPONIBLES.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setColorHex(item)}
            style={[
              styles.colorCircle,
              { backgroundColor: item },
              colorHex === item && styles.colorSelected,
            ]}
          >
            {colorHex === item && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón Guardar con texto dinámico */}
      <TouchableOpacity
        style={[styles.button, (submitting || loading) && { opacity: 0.7 }]}
        onPress={handleGuardar}
        disabled={submitting || loading}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {esEdicion ? "Guardar Cambios" : "Crear Cuenta"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCancelar} style={styles.secondaryButton}>
        <Ionicons name="arrow-back" size={18} color="#94A3B8" />
        <Text style={styles.secondaryText}>Cancelar y Volver</Text>
      </TouchableOpacity>

      {/* Margen inferior para que no quede pegado abajo al scrollear */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },
  backText: {
    color: "white",
    fontWeight: "600",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    color: "#94A3B8",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  loaderPlaceholder: {
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    color: "white",
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  tipoButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1E293B",
    borderRadius: 10,
  },
  tipoActive: {
    backgroundColor: "#38BDF8",
  },
  tipoText: {
    color: "#94A3B8",
  },
  tipoTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#38BDF8",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontWeight: "bold",
  },
  error: {
    color: "#F87171",
    marginBottom: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 15,
    paddingVertical: 12,
  },
  secondaryText: {
    color: "#94A3B8",
    fontWeight: "500",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 15,
    marginTop: 5,
  },
  colorCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSelected: {
    borderColor: "white",
    transform: [{ scale: 1.1 }],
  },
});
