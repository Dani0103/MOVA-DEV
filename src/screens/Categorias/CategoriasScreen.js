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
import { useTheme } from "../../theme/useTheme";

// Data de ejemplo (esto luego vendrá de tu API Laravel)
export default function CategoriasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const { categorias, loading, refreshCategories } = useCategories();
  const [tab, setTab] = useState("ingreso"); // 'gasto' o 'ingreso'

  useEffect(() => {
    refreshCategories(token, user.id);
  }, []);

  const categoriasFiltradas = categorias.filter(
    (c) => c.tipo === tab && c.usuario_id == user?.id,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header con Título y Botón de Añadir */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Categorías</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("CrearCategoria")}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Selector de Tipo (Tabs) */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
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
                tab === type.id && [styles.tabActive, { backgroundColor: theme.cardSecondary }],
                { minWidth: 100 }, // Asegura espacio para el texto
              ]}
              onPress={() => setTab(type.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.textSecondary },
                  tab === type.id && { color: type.color || theme.primary }, // Usa el color de la constante
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
            color={theme.primary}
            size="large"
            style={{ marginTop: 20 }}
          />
        ) : categoriasFiltradas.length > 0 ? (
          /* Muestra el Grid si hay datos */
          <View style={styles.grid}>
            {categoriasFiltradas.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: theme.card }]}
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
                <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Muestra esta vista si NO hay datos */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="folder-open-outline" size={60} color="#475569" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay categorías</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Aún no has agregado categorías de tipo {tab}.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.cardSecondary, borderColor: "#475569" }]}
              onPress={() => navigation.navigate("CrearCategoria")}
            >
              <Text style={[styles.emptyButtonText, { color: theme.primary }]}>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
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
  tabActive: {},
  tabText: {
    fontWeight: "600",
  },
  tabTextActive: {},
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
});
