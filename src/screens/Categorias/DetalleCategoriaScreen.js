import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function DetalleCategoriaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibimos la categoría por parámetros
  const { categoria } = route.params;

  // Mock de movimientos filtrados por esta categoría
  // En el futuro, esto vendrá de un query a tu API: /movimientos?categoria_id=X
  const movimientos = [
    {
      id: 1,
      descripcion: "Cena familiar",
      monto: 85000,
      fecha: "Hoy",
      tipo: "gasto",
    },
    {
      id: 2,
      descripcion: "Supermercado",
      monto: 120000,
      fecha: "Ayer",
      tipo: "gasto",
    },
    {
      id: 3,
      descripcion: "Almuerzo oficina",
      monto: 25000,
      fecha: "25 Feb",
      tipo: "gasto",
    },
  ];

  const totalMonto = movimientos.reduce((acc, mov) => acc + mov.monto, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle Categoría</Text>
        {/* <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={20} color="#38BDF8" />
        </TouchableOpacity> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Info de Categoría */}
        <View style={styles.catInfoCard}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: categoria.color + "20" },
            ]}
          >
            <Ionicons
              name={categoria.icono}
              size={40}
              color={categoria.color}
            />
          </View>
          <Text style={styles.catName}>{categoria.nombre}</Text>
          <Text style={styles.catType}>{categoria.tipo.toUpperCase()}</Text>
        </View>

        {/* Card de Gastos/Ingresos Totales */}
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Total este mes</Text>
          <Text
            style={[
              styles.statsAmount,
              { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
            ]}
          >
            {categoria.tipo === "gasto" ? "-" : "+"} ${" "}
            {totalMonto.toLocaleString()}
          </Text>
        </View>

        {/* Lista de Movimientos */}
        <Text style={styles.sectionTitle}>Movimientos relacionados</Text>

        {movimientos.length > 0 ? (
          movimientos.map((mov) => (
            <View key={mov.id} style={styles.movCard}>
              <View style={styles.movInfo}>
                <Text style={styles.movDesc}>{mov.descripcion}</Text>
                <Text style={styles.movDate}>{mov.fecha}</Text>
              </View>
              <Text
                style={[
                  styles.movAmount,
                  { color: categoria.tipo === "gasto" ? "#F87171" : "#4ADE80" },
                ]}
              >
                $ {mov.monto.toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay movimientos registrados en esta categoría.
            </Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  editBtn: {
    padding: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  catInfoCard: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  catName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  catType: {
    color: "#94A3B8",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  statsLabel: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 5,
  },
  statsAmount: {
    fontSize: 28,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  movCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  movDesc: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  movDate: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  movAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
});
