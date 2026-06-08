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

// Devuelve la etiqueta del grupo de fecha: Hoy, Ayer, dd MMM, etc.
function dateGroupLabel(fechaStr) {
  if (!fechaStr) return "Sin fecha";
  const d = startOfDay(new Date(fechaStr));
  const now = startOfDay(new Date());
  const ayer = new Date(now);
  ayer.setDate(ayer.getDate() - 1);

  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (d.getTime() === now.getTime()) return "Hoy";
  if (d.getTime() === ayer.getTime()) return "Ayer";
  if (diffDays > 0 && diffDays < 7) {
    return d.toLocaleDateString("es-ES", { weekday: "long" })
      .replace(/^./, (s) => s.toUpperCase());
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
  }
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// Devuelve solo "HH:mm" para mostrar dentro del row
function formatHora(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

const TIPOS = [
  { id: null, label: "Todos", icon: "apps-outline" },
  { id: "gasto", label: "Gastos", color: "#F87171", icon: "trending-down" },
  { id: "ingreso", label: "Ingresos", color: "#4ADE80", icon: "trending-up" },
  { id: "transferencia", label: "Transf.", color: "#38BDF8", icon: "swap-horizontal" },
];

const PERIODOS = [
  { id: "mes", label: "Este mes" },
  { id: "semana", label: "Esta semana" },
  { id: "hoy", label: "Hoy" },
  { id: "todo", label: "Todo" },
];

// Icono Ionicons para una categoria (acepta tanto "x" como "x-outline")
function getCatIconName(icono, fallback = "pricetag-outline") {
  if (!icono) return fallback;
  if (icono.endsWith("-outline") || icono.endsWith("-sharp")) return icono;
  return `${icono}-outline`;
}

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
        // La API devuelve categoria/cuenta anidadas: usar el id del objeto, no campos planos
        const catId = m.categoria?.id ?? m.categoria_id ?? null;
        if (categoriaFilter && catId !== categoriaFilter) return false;
        if (cuentaFilter) {
          const origenId = m.cuenta_origen?.id ?? m.cuenta_origen_id ?? null;
          const destinoId = m.cuenta_destino?.id ?? m.cuenta_destino_id ?? null;
          if (origenId !== cuentaFilter && destinoId !== cuentaFilter) return false;
        }
        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          if (!(m.descripcion || "").toLowerCase().includes(q)) return false;
        }
        if (desde) {
          const fechaMov = new Date(m.fecha || m.creado_en);
          if (fechaMov < desde) return false;
        }
        if (hasta) {
          const fechaMov = new Date(m.fecha || m.creado_en);
          if (fechaMov > hasta) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const fa = new Date(a.fecha || a.creado_en).getTime();
        const fb = new Date(b.fecha || b.creado_en).getTime();
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

  // Agrupar movimientos por fecha (Hoy, Ayer, dd MMM, ...)
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const m of filtered) {
      const fecha = m.fecha || m.creado_en;
      const label = dateGroupLabel(fecha);
      if (!groups.has(label)) {
        groups.set(label, { label, fecha: new Date(fecha), items: [] });
      }
      groups.get(label).items.push(m);
    }
    // Convertir a array, ordenar por fecha (mas reciente primero)
    return Array.from(groups.values()).sort((a, b) => b.fecha - a.fecha);
  }, [filtered]);

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
        stickyHeaderIndices={[0]}
      >
        {/* ── Sticky filter zone: siempre visible al hacer scroll ──────── */}
        <View style={[styles.stickyFilters, { backgroundColor: theme.background }]}>
          {/* Barra superior: buscar + boton avanzados */}
          <View style={styles.filterBar}>
            <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
              <Ionicons name="search-outline" size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Buscar por descripción..."
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

          {/* Filtros rapidos siempre visibles: TIPO con iconos */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsRow}
          >
            {TIPOS.map((t) => {
              const active = tipoFilter === t.id;
              const color = t.color ?? theme.primary;
              return (
                <TouchableOpacity
                  key={String(t.id)}
                  onPress={() => setTipoFilter(t.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? color + "20" : theme.card },
                    active && { borderColor: color, borderWidth: 1.5 },
                  ]}
                >
                  {t.icon && (
                    <Ionicons
                      name={t.icon}
                      size={14}
                      color={active ? color : theme.textSecondary}
                    />
                  )}
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? color : theme.textSecondary },
                      active && { fontWeight: "700" },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filtros rapidos: PERIODO */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsRow}
          >
            {PERIODOS.map((p) => {
              const active = periodoFilter === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPeriodoFilter(p.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? theme.primary + "25" : theme.card },
                    active && { borderColor: theme.primary, borderWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? theme.primary : theme.textSecondary },
                      active && { fontWeight: "700" },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Panel desplegable: filtros avanzados (categoria + cuenta) */}
          {filtersOpen && (
            <View style={[styles.filterPanelInline, { backgroundColor: theme.card }]}>
              {categorias.length > 0 && (
                <>
                  <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Categoría</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
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
                      .filter((c) => (!tipoFilter || c.tipo === tipoFilter) && c.activa !== false)
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

              {cuentas.length > 0 && (
                <>
                  <Text style={[styles.filterSectionLabel, { color: theme.textMuted }]}>Cuenta</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
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

              {activeCount > 0 && (
                <TouchableOpacity onPress={clearAll} style={[styles.clearBtn, { borderColor: theme.border }]}>
                  <Ionicons name="close-circle-outline" size={15} color={theme.textMuted} />
                  <Text style={[styles.clearBtnText, { color: theme.textMuted }]}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── Summary compacto: barra horizontal ────────────────────────── */}
        <View style={[styles.summaryCompact, { backgroundColor: theme.card }]}>
          <View style={styles.summaryCol}>
            <View style={styles.summaryDot}>
              <Ionicons name="arrow-down" size={12} color="#4ADE80" />
            </View>
            <View>
              <Text style={[styles.summaryColLabel, { color: theme.textMuted }]}>Ingresos</Text>
              <Text style={styles.summaryColValueIn} numberOfLines={1}>
                ${ingresos.toLocaleString("es-CO")}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryCol}>
            <View style={[styles.summaryDot, { backgroundColor: "rgba(248,113,113,0.15)" }]}>
              <Ionicons name="arrow-up" size={12} color="#F87171" />
            </View>
            <View>
              <Text style={[styles.summaryColLabel, { color: theme.textMuted }]}>Gastos</Text>
              <Text style={styles.summaryColValueOut} numberOfLines={1}>
                ${gastos.toLocaleString("es-CO")}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryCol}>
            <View
              style={[
                styles.summaryDot,
                {
                  backgroundColor:
                    ingresos - gastos >= 0
                      ? "rgba(74,222,128,0.15)"
                      : "rgba(248,113,113,0.15)",
                },
              ]}
            >
              <Ionicons
                name={ingresos - gastos >= 0 ? "checkmark" : "alert"}
                size={12}
                color={ingresos - gastos >= 0 ? "#4ADE80" : "#F87171"}
              />
            </View>
            <View>
              <Text style={[styles.summaryColLabel, { color: theme.textMuted }]}>Balance</Text>
              <Text
                style={[
                  styles.summaryColValueBal,
                  { color: ingresos - gastos >= 0 ? "#4ADE80" : "#F87171" },
                ]}
                numberOfLines={1}
              >
                {ingresos - gastos >= 0 ? "+" : ""}${(ingresos - gastos).toLocaleString("es-CO")}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Transaction list: agrupada por fecha ──────────────────────── */}
        {filtered.length > 0 ? (
          <View style={styles.listWrap}>
            {grouped.map((group) => {
              // Totales del grupo (para el header del día)
              const grupoIngresos = group.items
                .filter((m) => m.tipo === "ingreso")
                .reduce((s, m) => s + Number(m.monto || 0), 0);
              const grupoGastos = group.items
                .filter((m) => m.tipo === "gasto")
                .reduce((s, m) => s + Number(m.monto || 0), 0);
              const grupoNeto = grupoIngresos - grupoGastos;

              return (
                <View key={group.label} style={styles.dateGroup}>
                  <View style={styles.dateGroupHeader}>
                    <Text style={[styles.dateGroupLabel, { color: theme.text }]}>
                      {group.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateGroupTotal,
                        { color: grupoNeto >= 0 ? "#4ADE80" : "#F87171" },
                      ]}
                    >
                      {grupoNeto >= 0 ? "+" : ""}${grupoNeto.toLocaleString("es-CO")}
                    </Text>
                  </View>

                  {group.items.map((mov) => {
                    const isIngreso = mov.tipo === "ingreso";
                    const isTransferencia = mov.tipo === "transferencia";
                    const amountColor = isIngreso
                      ? "#4ADE80"
                      : isTransferencia
                      ? "#38BDF8"
                      : "#F87171";
                    const catColor = mov.categoria?.color_hex || amountColor;
                    const iconName = mov.categoria?.icono
                      ? getCatIconName(mov.categoria.icono)
                      : isIngreso
                      ? "arrow-down-outline"
                      : isTransferencia
                      ? "swap-horizontal-outline"
                      : "arrow-up-outline";

                    return (
                      <TouchableOpacity
                        key={mov.id}
                        activeOpacity={0.75}
                        onPress={() =>
                          navigation.navigate("DetalleMovimiento", {
                            movimiento: mov,
                          })
                        }
                        style={[
                          styles.transaction,
                          {
                            backgroundColor: theme.card,
                            borderLeftColor: catColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.tipoIndicator,
                            { backgroundColor: catColor + "20" },
                          ]}
                        >
                          <Ionicons name={iconName} size={20} color={catColor} />
                        </View>

                        <View style={styles.leftContainer}>
                          <Text
                            style={[styles.transactionText, { color: theme.text }]}
                            numberOfLines={1}
                          >
                            {mov.descripcion || mov.categoria?.nombre || "Sin descripción"}
                          </Text>
                          <View style={styles.metaRow}>
                            {mov.categoria?.nombre && (
                              <Text
                                style={[styles.metaText, { color: theme.textMuted }]}
                                numberOfLines={1}
                              >
                                {mov.categoria.nombre}
                              </Text>
                            )}
                            {mov.cuenta_origen?.nombre && (
                              <>
                                <Text style={[styles.metaSep, { color: theme.textMuted }]}>
                                  •
                                </Text>
                                <Text
                                  style={[styles.metaText, { color: theme.textMuted }]}
                                  numberOfLines={1}
                                >
                                  {mov.cuenta_origen.nombre}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>

                        <View style={styles.rightContainer}>
                          <Text style={[styles.amountText, { color: amountColor }]}>
                            {isIngreso ? "+" : isTransferencia ? "" : "-"}$
                            {Number(mov.monto || 0).toLocaleString("es-CO")}
                          </Text>
                          <Text style={[styles.timeText, { color: theme.textMuted }]}>
                            {formatHora(mov.fecha || mov.creado_en)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name={activeCount > 0 ? "search-outline" : "receipt-outline"}
                size={44}
                color={theme.textMuted}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {activeCount > 0
                ? "Sin resultados"
                : "Aún no hay movimientos"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {activeCount > 0
                ? "Prueba ajustando o limpiando los filtros."
                : "Toca el botón + para registrar tu primer movimiento."}
            </Text>
            {activeCount > 0 ? (
              <TouchableOpacity
                onPress={clearAll}
                style={[styles.emptyAction, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="refresh" size={16} color="white" />
                <Text style={styles.emptyActionText}>Limpiar filtros</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("CrearMovimiento")}
                style={[styles.emptyAction, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="add" size={18} color="white" />
                <Text style={styles.emptyActionText}>Nuevo movimiento</Text>
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

  // Summary compacto
  summaryCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 14,
    gap: 6,
  },
  summaryCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  summaryDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(74,222,128,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryColLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryColValueIn: {
    color: "#4ADE80",
    fontWeight: "700",
    fontSize: 14,
  },
  summaryColValueOut: {
    color: "#F87171",
    fontWeight: "700",
    fontSize: 14,
  },
  summaryColValueBal: {
    fontWeight: "700",
    fontSize: 14,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    opacity: 0.4,
  },

  // Sticky filters zone (top)
  stickyFilters: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  quickChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    paddingRight: 12,
  },
  chipScrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    paddingRight: 12,
  },
  filterPanelInline: {
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },

  // Filter bar
  filterBar: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" },
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

  // Lista agrupada
  listWrap: { gap: 16 },
  dateGroup: { gap: 8 },
  dateGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  dateGroupLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dateGroupTotal: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Transaction row
  transaction: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 3,
  },
  tipoIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  leftContainer: { flex: 1, minWidth: 0 },
  transactionText: { fontSize: 14, fontWeight: "600" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  metaText: { fontSize: 11, flexShrink: 1 },
  metaSep: { fontSize: 11 },
  rightContainer: { alignItems: "flex-end", marginLeft: 4 },
  amountText: { fontSize: 15, fontWeight: "700" },
  timeText: { fontSize: 10, marginTop: 2 },

  // Empty mejorado
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyActionText: { color: "white", fontWeight: "700", fontSize: 14 },

  // FAB
  fab: {
    position: "absolute", bottom: 30, right: 25,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center",
    elevation: 8, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
});
