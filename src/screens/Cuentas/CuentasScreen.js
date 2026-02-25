import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CuentasScreen() {
  const navigation = useNavigation();

  const cuentas = [
    { id: 1, nombre: "Cuenta Bancolombia", tipo: "Ahorros", saldo: 5200000 },
    { id: 2, nombre: "Nequi", tipo: "Digital", saldo: 850000 },
    { id: 3, nombre: "Efectivo", tipo: "Efectivo", saldo: 350000 },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis Cuentas</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CrearCuenta")}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {cuentas.map((cuenta) => (
          <TouchableOpacity
            key={cuenta.id}
            style={styles.card}
            onPress={() => navigation.navigate("DetalleCuenta", { cuenta })}
          >
            <View>
              <Text style={styles.accountName}>{cuenta.nombre}</Text>
              <Text style={styles.accountType}>{cuenta.tipo}</Text>
            </View>

            <Text style={styles.balance}>
              $ {cuenta.saldo.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  accountName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  accountType: {
    color: "#94A3B8",
    marginTop: 4,
  },

  balance: {
    color: "#38BDF8",
    fontWeight: "bold",
    fontSize: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: "#38BDF8",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
