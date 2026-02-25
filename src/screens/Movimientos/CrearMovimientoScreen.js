import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";

export default function CrearMovimientoScreen({
  navigation,
  movimientos,
  setMovimientos,
}) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);

  const handleGuardar = () => {
    const nuevoMovimiento = {
      id: Date.now(),
      descripcion,
      monto: parseFloat(monto),
      tipo,
    };

    setMovimientos([...movimientos, nuevoMovimiento]);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>Nuevo Movimiento</Text> */}

      <TextInput
        placeholder="Descripción"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        placeholder="Monto"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        style={styles.input}
        value={monto}
        onChangeText={setMonto}
      />

      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoButton, tipo === "ingreso" && styles.tipoActive]}
          onPress={() => setTipo("ingreso")}
        >
          <Text style={styles.tipoText}>Ingreso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoButton, tipo === "gasto" && styles.tipoActive]}
          onPress={() => setTipo("gasto")}
        >
          <Text style={styles.tipoText}>Gasto</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 20,
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

  button: {
    backgroundColor: "#38BDF8",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "bold",
    color: "#0F172A",
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
});
