import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Data de ejemplo (esto luego vendrá de tu API Laravel)
const CATEGORIAS_MOCK = [
  {
    id: 1,
    nombre: "Alimentación",
    icono: "fast-food",
    color: "#F87171",
    tipo: "gasto",
  },
  {
    id: 2,
    nombre: "Salario",
    icono: "cash",
    color: "#4ADE80",
    tipo: "ingreso",
  },
  {
    id: 3,
    nombre: "Transporte",
    icono: "car",
    color: "#38BDF8",
    tipo: "gasto",
  },
  { id: 4, nombre: "Vivienda", icono: "home", color: "#FB923C", tipo: "gasto" },
  {
    id: 5,
    nombre: "Freelance",
    icono: "laptop",
    color: "#A78BFA",
    tipo: "ingreso",
  },
];

export default function CategoriasScreen() {
  const navigation = useNavigation();

  const [tab, setTab] = useState("gasto"); // 'gasto' o 'ingreso'
  const [loading, setLoading] = useState(false);

  const categoriasFiltradas = CATEGORIAS_MOCK.filter((c) => c.tipo === tab);

  return (
    <View style={styles.container}>
      {/* Header con Título y Botón de Añadir */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categorías</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CrearCategoria")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Selector de Tipo (Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "gasto" && styles.tabActive]}
          onPress={() => setTab("gasto")}
        >
          <Text
            style={[styles.tabText, tab === "gasto" && styles.tabTextActive]}
          >
            Gastos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "ingreso" && styles.tabActive]}
          onPress={() => setTab("ingreso")}
        >
          <Text
            style={[styles.tabText, tab === "ingreso" && styles.tabTextActive]}
          >
            Ingresos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            color="#38BDF8"
            size="large"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.grid}>
            {categoriasFiltradas.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate("DetalleCategoria", { categoria: cat })
                }
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: cat.color + "20" },
                  ]}
                >
                  <Ionicons name={cat.icono} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.nombre}
                </Text>
                {/* <TouchableOpacity style={styles.dotsBtn}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity> */}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    backgroundColor: "#38BDF8",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#334155",
  },
  tabText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#38BDF8",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    backgroundColor: "#1E293B",
    width: "48%", // Dos columnas
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  dotsBtn: {
    position: "absolute",
    right: 5,
    top: 10,
    padding: 5,
  },
});
