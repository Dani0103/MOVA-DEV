import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { universalAlert } from "../../utils/universalAlert";
import { GetAccount } from "../../services/CuentaService";
import { useAuth } from "../../context/AuthContext";
import { useAccounts } from "../../context/AccountContext";

export default function CuentasScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

  // 🔹 Obtenemos los estados y funciones globales
  const { cuentas, loading, refreshAccounts } = useAccounts();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await GetAccount(token);
      // Laravel devuelve { data: [...] }, así que asignamos response.data
      setCuentas(response.data);
    } catch (err) {
      universalAlert(
        "Error",
        err.message || "No se pudieron cargar las cuentas.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la carga inicial
  useEffect(() => {
    const initLoad = async () => {
      try {
        await refreshAccounts(token);
      } catch (err) {
        universalAlert("Error", "No se pudieron cargar las cuentas.");
      }
    };

    initLoad();

    // 🔹 Recargar cuando la pantalla gane el foco (por si hubo cambios en otras pantallas)
    const unsubscribe = navigation.addListener("focus", () => {
      refreshAccounts(token);
    });
    return unsubscribe;
  }, [navigation, token]);

  // 🔹 Función para el gesto de "palar hacia abajo para refrescar"
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccounts(token, true); // true para forzar la petición a la API
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <ScrollView
        style={styles.containerPadre}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#38BDF8"
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis Cuentas</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CrearCuenta")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#38BDF8"
            style={{ marginTop: 20 }}
          />
        ) : cuentas.length > 0 ? (
          cuentas.map((cuenta) => (
            <TouchableOpacity
              key={cuenta.id}
              style={[
                styles.card,
                {
                  borderLeftWidth: 5,
                  borderLeftColor: cuenta.color_hex || "#38BDF8",
                },
              ]}
              onPress={() => navigation.navigate("DetalleCuenta", { cuenta })}
            >
              <View style={styles.infoContainer}>
                <Text style={styles.accountName}>{cuenta.nombre}</Text>
                <Text style={styles.accountType}>
                  {cuenta.tipo_cuenta?.nombre || "General"}
                </Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balance}>
                  {cuenta.moneda?.simbolo || "$"}{" "}
                  {parseFloat(cuenta.saldo_actual).toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                  })}
                </Text>
                <Text style={styles.currencyCode}>{cuenta.moneda?.codigo}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color="#1E293B" />
            <Text style={styles.emptyText}>No hay cuentas registradas</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPadre: {
    flex: 1,
    padding: 15,
  },

  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Sombra para iOS/Web
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Elevación para Android
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
  },
  accountName: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  accountType: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 13,
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balance: {
    color: "#38BDF8",
    fontWeight: "bold",
    fontSize: 18,
  },
  currencyCode: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#38BDF8",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 10,
    textAlign: "center",
  },
});
