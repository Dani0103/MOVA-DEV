import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function CrearCuentaScreen() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [tipo, setTipo] = useState("Ahorros");
  const [error, setError] = useState("");

  const tiposCuenta = ["Ahorros", "Corriente", "Digital", "Efectivo"];

  const handleGuardar = () => {
    if (!nombre || !saldo) {
      setError("Todos los campos son obligatorios");
      return;
    }

    console.log("Cuenta creada:", {
      nombre,
      tipo,
      saldo: parseFloat(saldo),
    });

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header interno */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Nueva Cuenta</Text>

        {/* Espaciador para centrar el título */}
        <View style={{ width: 70 }} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Nombre */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        placeholder="Ej: Bancolombia"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={nombre}
        onChangeText={(v) => {
          setNombre(v);
          if (error) setError("");
        }}
      />

      {/* Tipo */}
      <Text style={styles.label}>Tipo de cuenta</Text>
      <View style={styles.tipoContainer}>
        {tiposCuenta.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tipoButton, tipo === item && styles.tipoActive]}
            onPress={() => setTipo(item)}
          >
            <Text
              style={[styles.tipoText, tipo === item && styles.tipoTextActive]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Saldo */}
      <Text style={styles.label}>Saldo Inicial</Text>
      <TextInput
        placeholder="0"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        keyboardType="numeric"
        value={saldo}
        onChangeText={(v) => {
          setSaldo(v);
          if (error) setError("");
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.secondaryButton}
      >
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
    fontSize: 18,
    fontWeight: "bold",
  },

  label: {
    color: "#94A3B8",
    marginBottom: 6,
    marginTop: 10,
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
});
