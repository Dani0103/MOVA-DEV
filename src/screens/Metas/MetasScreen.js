import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const METAS_MOCK = [
  {
    id: 1,
    nombre: "Fondo de Emergencia",
    objetivo: 5000000,
    actual: 2500000,
    color: "#38BDF8",
    icono: "shield-checkmark",
  },
  {
    id: 2,
    nombre: "Nuevo iPhone",
    objetivo: 4500000,
    actual: 900000,
    color: "#A78BFA",
    icono: "phone-portrait",
  },
  {
    id: 3,
    nombre: "Viaje Vacaciones",
    objetivo: 8000000,
    actual: 8000000,
    color: "#4ADE80",
    icono: "airplane",
  },
];

export default function MetasScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mis Metas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CrearMeta")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {METAS_MOCK.map((meta) => {
          const progreso = (meta.actual / meta.objetivo) * 100;
          const completada = progreso >= 100;

          return (
            <TouchableOpacity
              key={meta.id}
              style={styles.metaCard}
              onPress={() => navigation.navigate("DetalleMeta", { meta })}
            >
              <View style={styles.metaHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: meta.color + "20" },
                  ]}
                >
                  <Ionicons name={meta.icono} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.metaName}>{meta.nombre}</Text>
                  <Text style={styles.metaAmount}>
                    $ {meta.actual.toLocaleString()} / ${" "}
                    {meta.objetivo.toLocaleString()}
                  </Text>
                </View>
                {completada && (
                  <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                )}
              </View>

              {/* Barra de Progreso */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progreso, 100)}%`,
                      backgroundColor: meta.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progreso.toFixed(0)}% completado
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "white" },
  addButton: {
    backgroundColor: "#38BDF8",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metaCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  metaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metaName: { color: "white", fontSize: 16, fontWeight: "bold" },
  metaAmount: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  progressBg: {
    height: 8,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
    fontWeight: "600",
  },
});
