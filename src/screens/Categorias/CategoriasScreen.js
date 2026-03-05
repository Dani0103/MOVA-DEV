import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../context/CategoryContext";
import { GetCategories } from "../../services/CategoriaService";
import { TRANSACTION_TYPES } from "../../constants/transactionTypes";

// Data de ejemplo (esto luego vendrá de tu API Laravel)
export default function CategoriasScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const { categorias, loading, refreshCategories } = useCategories();
  const [tab, setTab] = useState("ingreso"); // 'gasto' o 'ingreso'

  useEffect(() => {
    refreshCategories(token, user.id);
  }, []);

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tab);

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {TRANSACTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.tab,
                tab === type.id && styles.tabActive,
                { minWidth: 100 }, // Asegura espacio para el texto
              ]}
              onPress={() => setTab(type.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === type.id && { color: type.color || "#38BDF8" }, // Usa el color de la constante
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {loading ? (
          <ActivityIndicator
            color="#38BDF8"
            size="large"
            style={{ marginTop: 20 }}
          />
        ) : categoriasFiltradas.length > 0 ? (
          /* Muestra el Grid si hay datos */
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
                    { backgroundColor: cat.color_hex + "20" },
                  ]}
                >
                  <Ionicons name={cat.icono} size={24} color={cat.color_hex} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Muestra esta vista si NO hay datos */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="folder-open-outline" size={60} color="#475569" />
            </View>
            <Text style={styles.emptyTitle}>No hay categorías</Text>
            <Text style={styles.emptySubtitle}>
              Aún no has agregado categorías de tipo {tab}.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("CrearCategoria")}
            >
              <Text style={styles.emptyButtonText}>
                Crear primera categoría
              </Text>
            </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtitle: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#475569",
  },
  emptyButtonText: {
    color: "#38BDF8",
    fontWeight: "600",
    fontSize: 15,
  },
});
