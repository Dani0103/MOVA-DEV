import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

// ── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getPeriodRange(period) {
  const now = new Date();
  switch (period) {
    case "hoy":
      return { desde: startOfDay(now), hasta: new Date(now.setHours(23, 59, 59, 999)) };
    case "semana": {
      const mon = startOfDay(now);
      mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
      return { desde: mon, hasta: null };
    }
    case "mes": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { desde: first, hasta: null };
    }
    default:
      return { desde: null, hasta: null };
  }
}

function formatFecha(str) {
  if (!str) return "Fecha desconocida";
  const d = new Date(str);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const TIPOS = [
  { id: null, label: "Todos" },
  { id: "gasto", label: "Gastos", color: "#F87171" },
  { id: "ingreso", label: "Ingresos", color: "#4ADE80" },
  { id: "transferencia", label: "Transf.", color: "#38BDF8" },
];

const PERIODOS = [
  { id: "mes", label: "Este mes" },
  { id: "semana", label: "Esta semana" },
  { id: "hoy", label: "Hoy" },
  { id: "todo", label: "Todo" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function MovimientosScreen({
  movimientos = [],
  loading,
  navigation,
  onRefresh,
  categorias = [],
  cuentas = [],
}) {
  const theme = useTheme();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tipoFilter, setTipoFilter] = useState(null);          // null = todos
  const [periodoFilter, setPeriodoFilter] = useState("mes");   // default: este mes
  const [categoriaFilter, setCategoriaFilter] = useState(null);
  const [cuentaFilter, setCuentaFilter] = useState(null);
  const [searchText, setSearchText] = useState("");

  // ── Derived: filtered list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const { desde, hasta } = getPeriodRange(periodoFilter);

    return [...movimientos]
      .filter((m) => {
        if (tipoFilter && m.tipo !== tipoFilter) return false;
        if (categoriaFilter && m.categoria_id !== categoriaFilter) return false;
        if (cuentaFilter) {
          const match =
            m.cuenta_origen_id === cuentaFilter ||
            m.cuenta_destino_id === cuentaFilter;
          if (!match) return false;
        }
        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          if (!(m.descripcion || "").toLowerCase().includes(q)) return false;
        }
        if (desde) {
          const fechaMov = new Date(m.creado_en || m.fecha);
          if (fechaMov < desde) return false;
        }
        if (hasta) {
          const fechaMov = new Date(m.creado_en || m.fecha);
          if (fechaMov > hasta) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const fa = new Date(a.creado_en || a.fecha).getTime();
        const fb = new Date(b.creado_en || b.fecha).getTime();
        return fb - fa;
      });
  }, [movimientos, tipoFilter, periodoFilter, categoriaFilter, cuentaFilter, searchText]);

  const ingresos = useMemo(
    () => filtered.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto || 0), 0),
    [filtered]
  );
  const gastos = useMemo(
    () => filtered.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Number(m.monto || 0), 0),
    [filtered]
  );

  // Active filter count (excluding default "mes" period)
  const activeCount = [
    tipoFilter !== null,
    periodoFilter !== "mes",
    categoriaFilter !== null,
    cuentaFilter !== null,
    searchText.trim() !== "",
  ].filter(Boolean).length;

  const clearAll = () => {
    setTipoFilter(null);
    setPeriodoFilter("mes");
    setCategoriaFilter(null);
    setCuentaFilter(null);
    setSearchText("");
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading && movimientos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Summary card ─────────────────────────────────────────────── */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>
              {periodoFilter === "mes" ? "Este mes" :
               periodoFilter === "semana" ? "Esta semana" :
               periodoFilter === "hoy" ? "Hoy" : "Todos los movimientos"}
            </Text>
            {filtered.length !== movimientos.length && (
              <Text style={[styles.filteredBadge, { color: theme.textMuted }]}>
                {filtered.length} de {movimientos.length}
              </Text>
            )}
          </View>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.labelSmall, { color: theme.textMuted }]}>Ingresos</Text>
              <Text style={styles.income}>+$ {ingresos.toLocaleString("es-CO")}</Text>
            </View>
            <View style={[styles.balancePill, { backgroundColor: theme.cardSecondary ?? theme.background }]}>
              <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>Balance</Text>
              <Text style={[styles.balanceValue, { color: ingresos - gastos >= 0 ? "#4ADE80" : "#F87171" }]}>
                {ingresos - gastos >= 0 ? "+" : ""}${(ingresos - gastos).toLocaleString("es-CO")}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.labelSmall, { color: theme.textMuted }]}>Gastos</Text>
              <Text style={styles.expense}>-$ {gastos.toLocaleString("es-CO")}</Text>
            </View>
          </View>
        </View>

        {/* ── Filter bar ───────────────────────────────────────────────── */}
        <View style={styles.filterBar}>
          {/* Search input */}
          <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar..."
              placeholderTextColor={theme.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter toggle button */}
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              { backgroundColor: filtersOpen ? theme.primary : theme.card },
            ]}
            onPress={() => setFiltersOpen((v) => !v)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={filtersOpen ? "white" : theme.textSecondary}
            />
            {activeCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Expanded filter panel ─────────────────────────────────────── */}
        {filtersOpen && (
          <View style={[styles.filterPanel, { backgroundColor: theme.card }]}>
            {/* Tipo */}
            <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Tipo</Text>
            <View style={styles.chipRow}>
              {TIPOS.map((t) => {
                const active = tipoFilter === t.id;
                return (
                  <TouchableOpacity
                    key={String(t.id)}
                    onPress={() => setTipoFilter(t.id)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? (t.color ?? theme.primary) + "25" : theme.background },
                      active && { borderColor: t.color ?? theme.primary, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? (t.color ?? theme.primary) : theme.textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Período */}
            <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Período</Text>
            <View style={styles.chipRow}>
              {PERIODOS.map((p) => {
                const active = periodoFilter === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setPeriodoFilter(p.id)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? theme.primary + "25" : theme.background },
                      active && { borderColor: theme.primary, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? theme.primary : theme.textSecondary }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Categoría */}
            {categorias.length > 0 && (
              <>
                <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollRow}>
                  <TouchableOpacity
                    onPress={() => setCategoriaFilter(null)}
                    style={[
                      styles.chip,
                      { backgroundColor: categoriaFilter === null ? theme.primary + "25" : theme.background },
                      categoriaFilter === null && { borderColor: theme.primary, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: categoriaFilter === null ? theme.primary : theme.textSecondary }]}>Todas</Text>
                  </TouchableOpacity>
                  {categorias
                    .filter((c) => !tipoFilter || c.tipo === tipoFilter)
                    .map((c) => {
                      const active = categoriaFilter === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setCategoriaFilter(active ? null : c.id)}
                          style={[
                            styles.chip,
                            { backgroundColor: active ? c.color_hex + "25" : theme.background },
                            active && { borderColor: c.color_hex, borderWidth: 1 },
                          ]}
                        >
                          <View style={[styles.catDot, { backgroundColor: c.color_hex }]} />
                          <Text style={[styles.chipText, { color: active ? c.color_hex : theme.textSecondary }]}>
                            {c.nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </>
            )}

            {/* Cuenta */}
            {cuentas.length > 0 && (
              <>
                <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Cuenta</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollRow}>
                  <TouchableOpacity
                    onPress={() => setCuentaFilter(null)}
                    style={[
                      styles.chip,
                      { backgroundColor: cuentaFilter === null ? theme.primary + "25" : theme.background },
                      cuentaFilter === null && { borderColor: theme.primary, borderWidth: 1 },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: cuentaFilter === null ? theme.primary : theme.textSecondary }]}>Todas</Text>
                  </TouchableOpacity>
                  {cuentas.map((c) => {
                    const active = cuentaFilter === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => setCuentaFilter(active ? null : c.id)}
                        style={[
                          styles.chip,
                          { backgroundColor: active ? (c.color_hex ?? theme.primary) + "25" : theme.background },
                          active && { borderColor: c.color_hex ?? theme.primary, borderWidth: 1 },
                        ]}
                      >
                        <View style={[styles.catDot, { backgroundColor: c.color_hex ?? theme.primary }]} />
                        <Text style={[styles.chipText, { color: active ? (c.color_hex ?? theme.primary) : theme.textSecondary }]}>
                          {c.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Clear */}
            {activeCount > 0 && (
              <TouchableOpacity onPress={clearAll} style={[styles.clearBtn, { borderColor: theme.border }]}>
                <Ionicons name="close-circle-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.clearBtnText, { color: theme.textMuted }]}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Transaction list ──────────────────────────────────────────── */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Historial</Text>
          {filtered.length > 0 && (
            <Text style={[styles.countText, { color: theme.textMuted }]}>{filtered.length} movimientos</Text>
          )}
        </View>

        {filtered.length > 0 ? (
          filtered.map((mov) => {
            const isIngreso = mov.tipo === "ingreso";
            const amountColor = isIngreso ? "#4ADE80" : "#F87171";
            return (
              <TouchableOpacity
                key={mov.id}
                activeOpacity={0.75}
                onPress={() => navigation.navigate("DetalleMovimiento", { movimiento: mov })}
              >
                <View style={[styles.transaction, { backgroundColor: theme.card }]}>
                  {/* Tipo indicator */}
                  <View style={[styles.tipoIndicator, { backgroundColor: amountColor + "20" }]}>
                    <Ionicons
                      name={isIngreso ? "arrow-down-outline" : "arrow-up-outline"}
                      size={18}
                      color={amountColor}
                    />
                  </View>

                  <View style={styles.leftContainer}>
                    <Text style={[styles.transactionText, { color: theme.text }]} numberOfLines={1}>
                      {mov.descripcion || "Sin descripción"}
                    </Text>
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>
                      {mov.categoria?.nombre
                        ? `${mov.categoria.nombre} · ${formatFecha(mov.creado_en || mov.fecha)}`
                        : formatFecha(mov.creado_en || mov.fecha)}
                    </Text>
                  </View>

                  <View style={styles.rightContainer}>
                    <Text style={[styles.amountText, { color: amountColor }]}>
                      {isIngreso ? "+" : "-"}${Number(mov.monto || 0).toLocaleString("es-CO")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {activeCount > 0 ? "Sin resultados para estos filtros" : "No hay movimientos todavía"}
            </Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={clearAll} style={styles.clearLinkBtn}>
                <Text style={[styles.clearLinkText, { color: theme.primary }]}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("CrearMovimiento")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  // Summary
  summaryCard: { padding: 20, borderRadius: 16, marginBottom: 14, borderWidth: 1 },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryTitle: { fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  filteredBadge: { fontSize: 11 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labelSmall: { fontSize: 12, marginBottom: 4 },
  income: { color: "#4ADE80", fontWeight: "bold", fontSize: 18 },
  expense: { color: "#F87171", fontWeight: "bold", fontSize: 18, textAlign: "right" },
  balancePill: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  balanceLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  balanceValue: { fontSize: 16, fontWeight: "bold" },

  // Filter bar
  filterBar: { flexDirection: "row", gap: 8, marginBottom: 10, alignItems: "center" },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterToggleBtn: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  filterBadge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: "#F87171", borderRadius: 8,
    width: 16, height: 16, justifyContent: "center", alignItems: "center",
  },
  filterBadgeText: { color: "white", fontSize: 9, fontWeight: "bold" },

  // Filter panel
  filterPanel: { borderRadius: 16, padding: 14, marginBottom: 14, gap: 8 },
  filterSectionLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipScrollRow: { flexDirection: "row" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginTop: 4,
  },
  clearBtnText: { fontSize: 12 },

  // List
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  countText: { fontSize: 12 },

  // Transaction row
  transaction: {
    padding: 14, borderRadius: 12, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  tipoIndicator: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  leftContainer: { flex: 1 },
  transactionText: { fontSize: 15, fontWeight: "500" },
  metaText: { fontSize: 12, marginTop: 2 },
  rightContainer: { alignItems: "flex-end" },
  amountText: { fontSize: 15, fontWeight: "bold" },

  // Empty
  emptyContainer: { alignItems: "center", marginTop: 50, gap: 10 },
  emptyText: { fontSize: 15 },
  clearLinkBtn: { paddingVertical: 6 },
  clearLinkText: { fontWeight: "600" },

  // FAB
  fab: {
    position: "absolute", bottom: 30, right: 25,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    elevation: 8, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
});
