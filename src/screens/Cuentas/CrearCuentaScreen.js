import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createAccount } from "../../services/CuentaService";
import { TypeAccount, TypeCurrency } from "../../services/CatalogoService";
import { useAuth } from "../../context/AuthContext";
import { universalAlert } from "../../utils/universalAlert";

export default function CrearCuentaScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();

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

  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [tipoId, setTipoId] = useState(null); // Guardamos el ID, no el nombre
  const [monedaId, setMonedaId] = useState(null);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [tiposMoneda, setTiposMoneda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [colorHex, setColorHex] = useState("#38BDF8");

  // 1. Cargar tipos de cuenta desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        //peticiones
        const dataCuentas = await TypeAccount(token);
        const dataMonedas = await TypeCurrency(token);

        setTiposCuenta(dataCuentas.data);
        setTiposMoneda(dataMonedas.data);

        if (user?.moneda_id) {
          setMonedaId(user.moneda_id);
        } else if (dataMonedas.length > 0) {
          setMonedaId(dataMonedas[0].id);
        }
        // if (data.length > 0) setTipoId(data[0].id); // Seleccionar el primero por defecto
      } catch (err) {
        universalAlert(
          "Error",
          "No se pudieron cargar los catálogos de cuenta.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGuardar = async () => {
    if (!nombre || !saldo || !tipoId) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setSubmitting(true);

      const dataToSend = {
        nombre: nombre,
        tipo_cuenta_id: tipoId, // El ID que sacamos del catálogo
        moneda_id: monedaId, // Tomado del contexto de usuario
        saldo: parseFloat(saldo), // Convertimos a número
        color_hex: colorHex,
      };

      await createAccount(dataToSend, token);

      universalAlert("¡Excelente!", "Tu cuenta ha sido creada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
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
        <Text style={styles.title}>Nueva Cuenta</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Nombre de la cuenta *</Text>
      <TextInput
        placeholder="Ej: Efectivo o Banco"
        placeholderTextColor="#64748B"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Selector de Moneda con Load Effect */}
      <Text style={styles.label}>Moneda *</Text>
      <View style={styles.tipoContainer}>
        {loading
          ? // Efecto visual de carga
            [1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.tipoButton, styles.loaderPlaceholder]}
              >
                <ActivityIndicator size="small" color="#38BDF8" />
              </View>
            ))
          : tiposMoneda.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.tipoButton,
                  monedaId === m.id && styles.tipoActive,
                ]}
                onPress={() => setMonedaId(m.id)}
              >
                <Text
                  style={[
                    styles.tipoText,
                    monedaId === m.id && styles.tipoTextActive,
                  ]}
                >
                  {m.codigo}
                </Text>
              </TouchableOpacity>
            ))}
      </View>

      {/* Selector de Tipo de Cuenta con Load Effect */}
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

      <Text style={styles.label}>Saldo Inicial *</Text>
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

      {/* Selector de Color */}
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

      <TouchableOpacity
        style={[styles.button, (submitting || loading) && { opacity: 0.7 }]}
        onPress={handleGuardar}
        disabled={submitting || loading}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Guardar Cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCancelar} style={styles.secondaryButton}>
        <Ionicons name="arrow-back" size={18} color="#94A3B8" />
        <Text style={styles.secondaryText}>Cancelar y Volver</Text>
      </TouchableOpacity>
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
    borderRadius: 12, // Te sugiero redondearlos para que se vea más moderno
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
    borderRadius: 10, // Coherencia visual
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
    transform: [{ scale: 1.1 }], // Hace que el seleccionado resalte un poco
  },
});
