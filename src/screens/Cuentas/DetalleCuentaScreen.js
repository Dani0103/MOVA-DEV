import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { universalAlert } from "../../utils/universalAlert";
import { ArchiveAccount } from "../../services/CuentaService";
import { loadMovimientos } from "../../services/MovimientosService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/useTheme";

// ── Helpers ────────────────────────────────────────────────────────────────

const TIPO_CONFIG = {
  ingreso:       { icon: "add-circle",       color: "#4ADE80" },
  gasto:         { icon: "remove-circle",    color: "#F87171" },
  transferencia: { icon: "swap-horizontal",  color: "#38BDF8" },
  prestamo:      { icon: "cash-outline",     color: "#F59E0B" },
};

function formatFecha(fechaStr) {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SkeletonBox({ style }) {
  return <View style={[{ backgroundColor: "#1E293B", borderRadius: 12 }, style]} />;
}

// ── Componente principal ───────────────────────────────────────────────────

export default function DetalleCuentaScreen() {
  const theme    = useTheme();
  const navigation = useNavigation();
  const route    = useRoute();
  const { token } = useAuth();

  const { cuenta } = route.params;

  const [movimientos, setMovimientos]   = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loadMovimientos(token, { cuenta_id: cuenta.id });
      setMovimientos(res?.data ?? []);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setLoading(false);
    }
  }, [cuenta.id, token]);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  // ── Totales ──────────────────────────────────────────────────────────────

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + parseFloat(m.monto || 0), 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, m) => acc + parseFloat(m.monto || 0), 0);

  const simbolo = cuenta.moneda?.simbolo || "$";

  // ── Acciones ─────────────────────────────────────────────────────────────

  const handleEditar = () => navigation.navigate("CrearCuenta", { cuenta });

  const handleArchivar = () => {
    universalAlert(
      "¿Archivar cuenta?",
      "La cuenta dejará de estar activa y no se sumará al saldo total, pero podrás consultar sus movimientos históricos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Archivar",
          style: "destructive",
          onPress: async () => {
            try {
              await ArchiveAccount(cuenta.id, token);
              universalAlert("Cuenta archivada", "La cuenta fue archivada correctamente.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo archivar la cuenta.");
            }
          },
        },
      ],
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* TopBar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: theme.text }]}>Detalle de cuenta</Text>
          <TouchableOpacity
            onPress={handleEditar}
            style={[styles.editBtnTop, { borderColor: theme.border }]}
          >
            <Ionicons name="pencil" size={18} color="#38BDF8" />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.card, borderTopColor: cuenta.color_hex || theme.primary },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.accountName, { color: theme.text }]}>{cuenta.nombre}</Text>
              <Text style={[styles.accountType, { color: theme.textSecondary }]}>
                {cuenta.tipo_cuenta?.nombre || "General"}
              </Text>
            </View>
          </View>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Saldo Disponible</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balance, { color: theme.text }]}>
              {simbolo} {parseFloat(cuenta.saldo_actual).toLocaleString()}
            </Text>
            <Text style={[styles.currencyBadge, { color: theme.primary }]}>
              {cuenta.moneda?.codigo}
            </Text>
          </View>
        </View>

        {/* Resumen ingresos / gastos */}
        <View style={styles.summaryRow}>
          <View style={[styles.incomeCard, { backgroundColor: theme.card }]}>
            <Ionicons name="trending-up" size={16} color="#4ADE80" />
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>Ingresos</Text>
            {loading
              ? <SkeletonBox style={{ height: 18, width: 80, marginTop: 4 }} />
              : <Text style={styles.income}>+ {simbolo} {ingresos.toLocaleString()}</Text>
            }
          </View>
          <View style={[styles.expenseCard, { backgroundColor: theme.card }]}>
            <Ionicons name="trending-down" size={16} color="#F87171" />
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>Gastos</Text>
            {loading
              ? <SkeletonBox style={{ height: 18, width: 80, marginTop: 4 }} />
              : <Text style={styles.expense}>- {simbolo} {gastos.toLocaleString()}</Text>
            }
          </View>
        </View>

        {/* Sección movimientos */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Movimientos</Text>
          {!loading && movimientos.length > 0 && (
            <Text style={[styles.countBadge, { color: theme.textMuted }]}>
              {movimientos.length} registros
            </Text>
          )}
        </View>

        {/* Estado cargando */}
        {loading && (
          <View style={styles.skeletonList}>
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} style={{ height: 64, marginBottom: 10 }} />
            ))}
          </View>
        )}

        {/* Lista de movimientos */}
        {!loading && movimientos.length > 0 && movimientos.map((mov) => {
          const config = TIPO_CONFIG[mov.tipo] ?? TIPO_CONFIG.gasto;
          const esIngreso = mov.tipo === "ingreso";
          const esTransferencia = mov.tipo === "transferencia";

          return (
            <TouchableOpacity
              key={mov.id}
              style={[styles.transaction, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate("DetalleMovimiento", { movimiento: mov })}
              activeOpacity={0.75}
            >
              {/* Ícono tipo */}
              <View style={[styles.iconBox, { backgroundColor: config.color + "20" }]}>
                <Ionicons name={config.icon} size={22} color={config.color} />
              </View>

              {/* Info */}
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDesc, { color: theme.text }]} numberOfLines={1}>
                  {mov.descripcion || mov.categoria?.nombre || "Sin descripción"}
                </Text>
                <View style={styles.transactionMeta}>
                  {mov.categoria && (
                    <View style={[styles.catDot, { backgroundColor: mov.categoria.color_hex }]} />
                  )}
                  <Text style={[styles.transactionDate, { color: theme.textMuted }]}>
                    {formatFecha(mov.fecha)}
                  </Text>
                  {esTransferencia && (
                    <Text style={[styles.transferLabel, { color: "#38BDF8" }]}>
                      · Transferencia
                    </Text>
                  )}
                </View>
              </View>

              {/* Monto */}
              <Text
                style={[
                  styles.transactionAmount,
                  { color: esIngreso ? "#4ADE80" : esTransferencia ? "#38BDF8" : "#F87171" },
                ]}
              >
                {esIngreso ? "+" : esTransferencia ? "" : "-"}
                {simbolo} {parseFloat(mov.monto).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Estado vacío */}
        {!loading && movimientos.length === 0 && (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Aún no hay movimientos en esta cuenta.
            </Text>
          </View>
        )}

        {/* Botón archivar */}
        <View style={{ height: 30 }} />
        <TouchableOpacity style={styles.archiveBtn} onPress={handleArchivar}>
          <Ionicons name="archive-outline" size={20} color="#F87171" />
          <Text style={styles.archiveText}>Archivar Cuenta</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  // TopBar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn:     { padding: 8, borderRadius: 12 },
  topTitle:    { fontSize: 18, fontWeight: "700" },
  editBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
  },
  editText: { color: "#38BDF8", fontWeight: "600", fontSize: 14 },

  // Balance card
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderTopWidth: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  accountName:   { fontSize: 22, fontWeight: "bold" },
  accountType:   { fontSize: 14 },
  balanceLabel:  { fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  balanceRow:    { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 5 },
  balance:       { fontSize: 32, fontWeight: "bold" },
  currencyBadge: { fontWeight: "bold", fontSize: 16 },

  // Summary
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  incomeCard: { padding: 15, borderRadius: 16, width: "48%", borderLeftWidth: 3, borderLeftColor: "#4ADE80" },
  expenseCard:{ padding: 15, borderRadius: 16, width: "48%", borderLeftWidth: 3, borderLeftColor: "#F87171" },
  summaryTitle: { fontSize: 12, marginTop: 5 },
  income:  { color: "#4ADE80", fontWeight: "bold", fontSize: 16, marginTop: 2 },
  expense: { color: "#F87171", fontWeight: "bold", fontSize: 16, marginTop: 2 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  countBadge:   { fontSize: 13 },

  // Skeleton
  skeletonList: { marginBottom: 10 },

  // Transaction row
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  transactionInfo: { flex: 1, minWidth: 0 },
  transactionDesc: { fontWeight: "600", fontSize: 14 },
  transactionMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  catDot:          { width: 8, height: 8, borderRadius: 4 },
  transactionDate: { fontSize: 12 },
  transferLabel:   { fontSize: 12, fontWeight: "600" },
  transactionAmount: { fontWeight: "700", fontSize: 15 },

  // Empty state
  emptyContainer: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
  },
  emptyText: { fontSize: 14, marginTop: 10, textAlign: "center" },

  // Archive
  archiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,113,113,0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.2)",
    marginHorizontal: 10,
  },
  archiveText: { color: "#F87171", fontWeight: "600", fontSize: 15 },
});
