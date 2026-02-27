import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function CrearDeudaScreen({ navigation }) {
  const [acreedor, setAcreedor] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [color, setColor] = useState("#F87171");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Deuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>¿A quién le debes?</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Banco, Amigo, Tienda..."
        placeholderTextColor="#64748B"
        value={acreedor}
        onChangeText={setAcreedor}
      />

      <Text style={styles.label}>Monto Total de la Deuda</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="numeric"
        placeholderTextColor="#64748B"
        value={montoTotal}
        onChangeText={setMontoTotal}
      />

      {/* Aquí podrías reciclar el selector de colores de CrearMetaScreen */}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.saveBtnText}>Registrar Deuda</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 30,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  label: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 10,
    marginTop: 20,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    color: "white",
  },
  saveBtn: {
    backgroundColor: "#F87171",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
