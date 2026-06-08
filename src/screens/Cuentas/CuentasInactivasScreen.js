import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useAccounts } from "../../context/AccountContext";
import { useTheme } from "../../theme/useTheme";
import { universalAlert } from "../../utils/universalAlert";
import {
  GetInactiveAccounts,
  ReactivateAccount,
} from "../../services/CuentaService";

function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  const d = new Date(fechaStr);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CuentasInactivasScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const { refreshAccounts } = useAccounts();

  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await GetInactiveAccounts(token);
      setCuentas(response?.data ?? []);
    } catch (err) {
      universalAlert(
        "Error",
        err.message || "No se pudieron cargar las cuentas inactivas."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleReactivar = (cuenta) => {
    universalAlert(
      "¿Reactivar cuenta?",
      `"${cuenta.nombre}" volverá a estar activa y se sumará a tu saldo total.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reactivar",
          onPress: async () => {
            try {
              setActivatingId(cuenta.id);
              await ReactivateAccount(cuenta.id, token);
              // Refrescar listas
              await loadData();
              await refreshAccounts(token, true);
              universalAlert(
                "¡Reactivada!",
                "La cuenta volvió a estar disponible."
              );
            } catch (e) {
              universalAlert(
                "Error",
                e.message || "No se pudo reactivar la cuenta."
              );
            } finally {
              setActivatingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: theme.text }]}>
          Cuentas inactivas
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <Text style={[styles.helper, { color: theme.textSecondary }]}>
          Estas cuentas están archivadas. Sus movimientos siguen registrados,
          pero el saldo no suma al total. Puedes reactivarlas cuando quieras.
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 40 }}
          />
        ) : cuentas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[styles.emptyIconCircle, { backgroundColor: theme.card }]}
            >
              <Ionicons name="archive-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Sin cuentas archivadas
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Todas tus cuentas están activas. Cuando archives alguna, aparecerá
              aquí.
            </Text>
          </View>
        ) : (
          cuentas.map((cuenta) => (
            <View
              key={cuenta.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderLeftColor: cuenta.color_hex || theme.primary,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[styles.accountName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {cuenta.nombre}
                    </Text>
                    <View style={styles.archivedBadge}>
                      <Ionicons name="archive" size={10} color="#FB923C" />
                      <Text style={styles.archivedBadgeText}>Archivada</Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.accountType, { color: theme.textSecondary }]}
                  >
                    {cuenta.tipo_cuenta?.nombre || "General"}
                  </Text>
                  {cuenta.eliminado_en && (
                    <Text style={[styles.archivedDate, { color: theme.textMuted }]}>
                      Archivada el {formatFecha(cuenta.eliminado_en)}
                    </Text>
                  )}
                </View>

                <View style={styles.balanceContainer}>
                  <Text style={[styles.balance, { color: theme.textSecondary }]}>
                    {cuenta.moneda?.simbolo || "$"}{" "}
                    {parseFloat(cuenta.saldo_actual || 0).toLocaleString("es-CO")}
                  </Text>
                  <Text style={[styles.currencyCode, { color: theme.textMuted }]}>
                    {cuenta.moneda?.codigo}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.reactivateBtn, { borderColor: "#4ADE80" }]}
                onPress={() => handleReactivar(cuenta)}
                disabled={activatingId === cuenta.id}
              >
                {activatingId === cuenta.id ? (
                  <ActivityIndicator size="small" color="#4ADE80" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color="#4ADE80" />
                    <Text style={styles.reactivateText}>Reactivar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  topTitle: { fontSize: 18, fontWeight: "700" },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  accountName: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  accountType: { fontSize: 13, marginBottom: 4 },
  archivedDate: { fontSize: 11, fontStyle: "italic" },
  archivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,146,60,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  archivedBadgeText: {
    color: "#FB923C",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  balanceContainer: { alignItems: "flex-end", marginLeft: 8 },
  balance: { fontWeight: "700", fontSize: 16 },
  currencyCode: { fontSize: 11, fontWeight: "600" },
  reactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  reactivateText: { color: "#4ADE80", fontWeight: "700", fontSize: 14 },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
