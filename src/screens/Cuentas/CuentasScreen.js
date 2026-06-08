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
import { useTheme } from "../../theme/useTheme";
import UpgradeModal from "../../components/shared/UpgradeModal";

export default function CuentasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();

  // 🔹 Obtenemos los estados y funciones globales
  const { user } = useAuth();
  const { cuentas, loading, refreshAccounts } = useAccounts();
  const [refreshing, setRefreshing]     = useState(false);
  const [showUpgrade, setShowUpgrade]   = useState(false);

  const limiteCuentas = user?.plan?.configuracion?.limite_cuentas ?? null;
  const cuentasActivas = cuentas.length;
  const limiteAlcanzado = limiteCuentas !== null && cuentasActivas >= limiteCuentas;

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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={styles.containerPadre}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Mis Cuentas</Text>
            {limiteCuentas !== null && (
              <Text style={[styles.limitBadge, { color: limiteAlcanzado ? "#F87171" : theme.textMuted }]}>
                {cuentasActivas}/{limiteCuentas} cuentas usadas
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: limiteAlcanzado ? "#F87171" : theme.primary }]}
            onPress={() => limiteAlcanzado ? setShowUpgrade(true) : navigation.navigate("CrearCuenta")}
          >
            <Ionicons name={limiteAlcanzado ? "lock-closed" : "add"} size={22} color="white" />
          </TouchableOpacity>
        </View>

        <UpgradeModal
          visible={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          title="Límite de cuentas alcanzado"
          message={`Tu plan Gratis permite hasta ${limiteCuentas} cuentas. Actualiza al plan Pro para crear hasta 20 cuentas.`}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 20 }}
          />
        ) : cuentas.length > 0 ? (
          cuentas.map((cuenta) => (
            <TouchableOpacity
              key={cuenta.id}
              style={[
                styles.card,
                { backgroundColor: theme.card },
                {
                  borderLeftWidth: 5,
                  borderLeftColor: cuenta.color_hex || theme.primary,
                },
              ]}
              onPress={() => navigation.navigate("DetalleCuenta", { cuenta })}
            >
              <View style={styles.infoContainer}>
                <Text style={[styles.accountName, { color: theme.text }]}>{cuenta.nombre}</Text>
                <Text style={[styles.accountType, { color: theme.textSecondary }]}>
                  {cuenta.tipo_cuenta?.nombre || "General"}
                </Text>
              </View>

              <View style={styles.balanceContainer}>
                <Text style={[styles.balance, { color: theme.primary }]}>
                  {cuenta.moneda?.simbolo || "$"}{" "}
                  {parseFloat(cuenta.saldo_actual).toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                  })}
                </Text>
                <Text style={[styles.currencyCode, { color: theme.textMuted }]}>{cuenta.moneda?.codigo}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color={theme.card} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay cuentas registradas</Text>
          </View>
        )}

        {/* Botón: Ver cuentas inactivas — solo cuando ya cargaron las activas */}
        {!loading && (
          <TouchableOpacity
            style={[
              styles.inactiveButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => navigation.navigate("CuentasInactivas")}
          >
            <View style={styles.inactiveButtonLeft}>
              <View style={styles.inactiveIconWrap}>
                <Ionicons name="archive-outline" size={20} color="#FB923C" />
              </View>
              <View>
                <Text style={[styles.inactiveButtonTitle, { color: theme.text }]}>
                  Cuentas inactivas
                </Text>
                <Text
                  style={[styles.inactiveButtonSubtitle, { color: theme.textMuted }]}
                >
                  Cuentas archivadas o que ya no usas
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPadre: {
    flex: 1,
    paddingHorizontal: 15,
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
  },
  card: {
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
    fontSize: 17,
    fontWeight: "700",
  },
  accountType: {
    marginTop: 4,
    fontSize: 13,
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balance: {
    fontWeight: "bold",
    fontSize: 18,
  },
  currencyCode: {
    fontSize: 11,
    fontWeight: "600",
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  limitBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  inactiveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
  },
  inactiveButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  inactiveIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(251,146,60,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveButtonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  inactiveButtonSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
