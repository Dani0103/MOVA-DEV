import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";

export default function CrearMovimientoScreen({
  navigation,
  movimientos,
  setMovimientos,
  cuentas,
  setCuentas,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [error, setError] = useState("");

  const handleGuardar = () => {
    if (!descripcion || !monto || !cuentaSeleccionada) {
      setError("Completa todos los campos");
      return;
    }

    const montoNumerico = parseFloat(monto);

    const nuevoMovimiento = {
      id: Date.now(),
      descripcion,
      monto: montoNumerico,
      tipo,
      cuentaId: cuentaSeleccionada.id,
    };

    setMovimientos([...movimientos, nuevoMovimiento]);

    // 🔥 Actualizar saldo de la cuenta
    const cuentasActualizadas = cuentas.map((c) => {
      if (c.id === cuentaSeleccionada.id) {
        const nuevoSaldo =
          tipo === "ingreso"
            ? c.saldo + montoNumerico
            : c.saldo - montoNumerico;

        return { ...c, saldo: nuevoSaldo };
      }
      return c;
    });

    setCuentas(cuentasActualizadas);

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nuevo Movimiento</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        placeholder="Descripción"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={descripcion}
        onChangeText={(v) => {
          setDescripcion(v);
          setError("");
        }}
      />

      <TextInput
        placeholder="Monto"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        style={styles.input}
        value={monto}
        onChangeText={(v) => {
          setMonto(v);
          setError("");
        }}
      />

      {/* Tipo */}
      <Text style={styles.label}>Tipo de movimiento</Text>
      <View style={styles.selectorContainer}>
        {TRANSACTION_TYPES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.selectorButton, // Usamos el estilo base unificado
              tipo === item.id && {
                backgroundColor: item.color + "20",
                borderColor: item.color,
                borderWidth: 1,
              },
            ]}
            onPress={() => setTipo(item.id)}
          >
            <Text
              style={[
                styles.selectorText, // Usamos el estilo base unificado
                tipo === item.id && { color: item.color, fontWeight: "bold" },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cuenta */}
      <Text style={styles.label}>Cuenta</Text>
      {!cuentas || cuentas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Primero debes crear una cuenta</Text>

          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => navigation.navigate("Cuentas")}
          >
            <Text style={styles.createAccountText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.selectorContainer}>
          {cuentas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.cuentaButton,
                cuentaSeleccionada?.id === c.id && styles.tipoActive,
              ]}
              onPress={() => setCuentaSeleccionada(c)}
            >
              <Text
                style={[
                  styles.tipoText,
                  cuentaSeleccionada?.id === c.id && styles.tipoTextActive,
                ]}
              >
                {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Botones */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGuardar}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    color: "white",
    marginBottom: 15,
  },

  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    alignItems: "center",
  },

  tipoActive: {
    backgroundColor: "#38BDF8",
  },

  tipoText: {
    color: "#94A3B8",
    fontWeight: "600",
  },

  tipoTextActive: {
    color: "white",
    fontWeight: "bold",
  },

  cuentaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  cuentaButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1E293B",
    borderRadius: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },

  button: {
    flex: 1,
    backgroundColor: "#38BDF8",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "bold",
    color: "#0F172A",
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#94A3B8",
    fontWeight: "600",
  },

  error: {
    color: "#F87171",
    marginBottom: 10,
  },

  emptyContainer: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyText: {
    color: "#94A3B8",
    marginBottom: 10,
  },

  createAccountBtn: {
    backgroundColor: "#38BDF8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  createAccountText: {
    color: "#0F172A",
    fontWeight: "bold",
  },

  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent", // Borde invisible por defecto para evitar saltos visuales
  },
  selectorText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
});
