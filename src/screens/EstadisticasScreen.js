import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../context/AuthContext";
import {
  getDateRange,
  getPeriodoLabel,
  loadEstadisticas,
  loadTransaccionesRango,
  agruparPorPeriodo,
  getTopCategorias,
  calcularInsights,
  fmtMoney,
} from "../services/EstadisticasService";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 80;

const PERIODOS = ["Semana", "Mes", "Año"];

export default function EstadisticasScreen() {
  const theme = useTheme();
  const { token } = useAuth();

  const [periodo, setPeriodo] = useState("Mes");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Datos crudos
  const [estadisticas, setEstadisticas] = useState(null);
  const [transacciones, setTransacciones] = useState([]);

  // Derived
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [topCats, setTopCats] = useState({ totalGastos: 0, categorias: [] });
  const [insights, setInsights] = useState(null);
  const [dateRange, setDateRange] = useState({});

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const range = getDateRange(periodo);
        setDateRange(range);

        const [estad, txs] = await Promise.all([
          loadEstadisticas(token, range.desde, range.hasta),
          loadTransaccionesRango(token, range.desde, range.hasta),
        ]);

        setEstadisticas(estad);
        setTransacciones(txs);

        // Procesar datos para gráficos
        const { labels, gastos } = agruparPorPeriodo(txs, periodo);
        setBarData({
          labels,
          datasets: [{ data: gastos.map((v) => Math.round(v)) }],
        });

        const { totalGastos, categorias } = getTopCategorias(txs);
        setTopCats({ totalGastos, categorias });
        setPieData(
          categorias.map((c) => ({
            name: c.nombre.length > 10 ? c.nombre.slice(0, 10) + "…" : c.nombre,
            population: Math.round(c.monto),
            color: c.color,
            legendFontColor: theme.textSecondary,
            legendFontSize: 12,
          }))
        );

        setInsights(calcularInsights(txs, periodo));
      } catch (e) {
        console.error("Error estadísticas:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, periodo]
  );

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => `rgba(56,189,248,${opacity})`,
    labelColor: () => theme.textSecondary,
    strokeWidth: 2,
    barPercentage: periodo === "Año" ? 0.4 : 0.6,
    propsForLabels: { fontSize: periodo === "Año" ? 8 : 10 },
    decimalPlaces: 0,
    formatYLabel: (v) => fmtMoney(Number(v)),
  };

  // Resumen de transacciones desde estadísticas
  const totalIngresos     = parseFloat(estadisticas?.transacciones?.ingresos     ?? 0);
  const totalGastos       = parseFloat(estadisticas?.transacciones?.gastos        ?? 0);
  const balanceNeto       = parseFloat(estadisticas?.transacciones?.balance_neto  ?? 0);
  const tasaAhorro        = totalIngresos > 0 ? (balanceNeto / totalIngresos) * 100 : 0;

  const metasTotal        = estadisticas?.metas?.total ?? 0;
  const metasActivas      = estadisticas?.metas?.activas ?? 0;
  const metaObj           = parseFloat(estadisticas?.metas?.monto_objetivo_total  ?? 0);
  const metaAct           = parseFloat(estadisticas?.metas?.monto_actual_total    ?? 0);
  const metasPct          = metaObj > 0 ? (metaAct / metaObj) * 100 : 0;

  const deudaTotal        = parseFloat(estadisticas?.deudas?.monto_total          ?? 0);
  const deudaPagada       = parseFloat(estadisticas?.deudas?.monto_pagado         ?? 0);
  const deudaPct          = deudaTotal > 0 ? (deudaPagada / deudaTotal) * 100 : 0;

  const periodoLabel = getPeriodoLabel(periodo, dateRange);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          tintColor={theme.primary}
        />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Estadísticas</Text>
          <Text style={[styles.periodoLabel, { color: theme.textSecondary }]}>{periodoLabel}</Text>
        </View>

        {/* Selector de periodo */}
        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          {PERIODOS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriodo(p)}
              style={[
                styles.tab,
                periodo === p && { backgroundColor: theme.primary + "25" },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: periodo === p ? theme.primary : theme.textMuted },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Calculando tus finanzas…
          </Text>
        </View>
      ) : (
        <>
          {/* ── Tarjetas de resumen ── */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
              <Ionicons name="trending-up" size={20} color="#4ADE80" />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Ingresos</Text>
              <Text style={[styles.summaryAmount, { color: "#4ADE80" }]}>
                ${fmtMoney(totalIngresos)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
              <Ionicons name="trending-down" size={20} color="#F87171" />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Gastos</Text>
              <Text style={[styles.summaryAmount, { color: "#F87171" }]}>
                ${fmtMoney(totalGastos)}
              </Text>
            </View>
          </View>

          {/* ── Balance neto + tasa de ahorro ── */}
          <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
            <View style={styles.balanceRow}>
              <View>
                <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Balance Neto</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: balanceNeto >= 0 ? "#4ADE80" : "#F87171" },
                  ]}
                >
                  {balanceNeto >= 0 ? "+" : "-"}${fmtMoney(Math.abs(balanceNeto))}
                </Text>
              </View>
              <View style={styles.savingsRateBox}>
                <Text style={[styles.savingsRateLabel, { color: theme.textMuted }]}>Tasa de ahorro</Text>
                <Text
                  style={[
                    styles.savingsRateValue,
                    { color: tasaAhorro >= 20 ? "#4ADE80" : tasaAhorro >= 0 ? "#FACC15" : "#F87171" },
                  ]}
                >
                  {tasaAhorro.toFixed(1)}%
                </Text>
                <Text style={[styles.savingsHint, { color: theme.textMuted }]}>
                  {tasaAhorro >= 20 ? "¡Excelente!" : tasaAhorro >= 10 ? "Bien" : tasaAhorro >= 0 ? "Mejorable" : "Negativo"}
                </Text>
              </View>
            </View>

            {/* Barra visual ingreso vs gasto */}
            {totalIngresos > 0 && (
              <View style={{ marginTop: 14 }}>
                <View style={[styles.biBarBg, { backgroundColor: theme.cardSecondary }]}>
                  <View
                    style={[
                      styles.biBarFill,
                      {
                        width: `${Math.min((totalGastos / totalIngresos) * 100, 100)}%`,
                        backgroundColor: totalGastos > totalIngresos ? "#F87171" : "#38BDF8",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.biBarHint, { color: theme.textMuted }]}>
                  Gastaste el {Math.min((totalGastos / totalIngresos) * 100, 100).toFixed(0)}% de tus ingresos
                </Text>
              </View>
            )}
          </View>

          {/* ── Gráfico de barras: Gastos por período ── */}
          {barData && barData.datasets[0].data.some((v) => v > 0) ? (
            <View style={[styles.chartSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>
                Gastos por {periodo === "Semana" ? "Día" : periodo === "Mes" ? "Semana" : "Mes"}
              </Text>
              <BarChart
                data={barData}
                width={CHART_W}
                height={200}
                yAxisLabel="$"
                chartConfig={chartConfig}
                verticalLabelRotation={periodo === "Año" ? 45 : 0}
                style={styles.chartStyle}
                showValuesOnTopOfBars={false}
                withInnerLines={false}
              />
            </View>
          ) : (
            <View style={[styles.chartSection, styles.emptyChart, { backgroundColor: theme.card }]}>
              <Ionicons name="bar-chart-outline" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyChartText, { color: theme.textMuted }]}>
                Sin gastos en este período
              </Text>
            </View>
          )}

          {/* ── Gastos por categoría ── */}
          {topCats.categorias.length > 0 ? (
            <View style={[styles.chartSection, { backgroundColor: theme.card }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>Gastos por Categoría</Text>

              <PieChart
                data={pieData}
                width={CHART_W}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                center={[0, 0]}
                hasLegend={false}
              />

              {/* Leyenda manual con porcentaje */}
              <View style={styles.legendContainer}>
                {topCats.categorias.map((cat) => (
                  <View key={cat.nombre} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.legendName, { color: theme.text }]} numberOfLines={1}>
                      {cat.nombre}
                    </Text>
                    <Text style={[styles.legendPct, { color: theme.textMuted }]}>
                      {cat.pct.toFixed(0)}%
                    </Text>
                    <Text style={[styles.legendAmount, { color: theme.textSecondary }]}>
                      ${fmtMoney(cat.monto)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* ── Insights automáticos ── */}
          {insights && (insights.diaMasGasto || insights.promedioGastoDiario > 0) && (
            <View style={styles.insightsRow}>
              {insights.diaMasGasto && (
                <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                  <Ionicons name="calendar-outline" size={22} color="#FACC15" />
                  <Text style={[styles.insightValue, { color: theme.text }]}>
                    {insights.diaMasGasto}
                  </Text>
                  <Text style={[styles.insightLabel, { color: theme.textMuted }]}>
                    Día con más gastos
                  </Text>
                </View>
              )}
              {insights.promedioGastoDiario > 0 && (
                <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                  <Ionicons name="calculator-outline" size={22} color="#38BDF8" />
                  <Text style={[styles.insightValue, { color: theme.text }]}>
                    ${fmtMoney(insights.promedioGastoDiario)}
                  </Text>
                  <Text style={[styles.insightLabel, { color: theme.textMuted }]}>
                    Promedio diario
                  </Text>
                </View>
              )}
              {topCats.categorias[0] && (
                <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                  <Ionicons name="flame-outline" size={22} color="#F87171" />
                  <Text
                    style={[styles.insightValue, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {topCats.categorias[0].nombre}
                  </Text>
                  <Text style={[styles.insightLabel, { color: theme.textMuted }]}>
                    Mayor gasto
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Progreso de Metas ── */}
          {metasTotal > 0 && (
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy-outline" size={20} color="#FACC15" />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Metas de Ahorro</Text>
                <Text style={[styles.sectionBadge, { backgroundColor: theme.cardSecondary, color: theme.textSecondary }]}>
                  {metasActivas} activa{metasActivas !== 1 ? "s" : ""}
                </Text>
              </View>

              <View style={[styles.progressBg, { backgroundColor: theme.cardSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(metasPct, 100)}%`, backgroundColor: "#FACC15" },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  Ahorrado: ${fmtMoney(metaAct)}
                </Text>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  {metasPct.toFixed(0)}% de ${fmtMoney(metaObj)}
                </Text>
              </View>
            </View>
          )}

          {/* ── Resumen de Deudas ── */}
          {deudaTotal > 0 && (
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card-outline" size={20} color="#F87171" />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Deudas</Text>
                <Text style={[styles.sectionBadge, { backgroundColor: theme.cardSecondary, color: theme.textSecondary }]}>
                  {estadisticas?.deudas?.activas ?? 0} activa{(estadisticas?.deudas?.activas ?? 0) !== 1 ? "s" : ""}
                </Text>
              </View>

              <View style={[styles.progressBg, { backgroundColor: theme.cardSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(deudaPct, 100)}%`, backgroundColor: "#4ADE80" },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  Pagado: ${fmtMoney(deudaPagada)}
                </Text>
                <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                  {deudaPct.toFixed(0)}% de ${fmtMoney(deudaTotal)}
                </Text>
              </View>

              <View style={[styles.deudaPendienteBox, { backgroundColor: "#F8717115" }]}>
                <Text style={[styles.deudaPendienteText, { color: "#F87171" }]}>
                  Pendiente: ${fmtMoney(deudaTotal - deudaPagada)}
                </Text>
              </View>
            </View>
          )}

          {/* ── Sin datos ── */}
          {transacciones.length === 0 && (
            <View style={[styles.section, styles.emptySection, { backgroundColor: theme.card }]}>
              <Ionicons name="analytics-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin movimientos</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Registra ingresos y gastos para ver tus estadísticas aquí
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header
  header: { marginTop: 20, marginBottom: 20, gap: 14 },
  title: { fontSize: 26, fontWeight: "bold" },
  periodoLabel: { fontSize: 13, marginTop: 2 },
  tabBar: { flexDirection: "row", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  tabText: { fontWeight: "600", fontSize: 13 },

  // Loading
  loadingBox: { height: 300, justifyContent: "center", alignItems: "center", gap: 14 },
  loadingText: { fontSize: 14 },

  // Summary cards
  summaryRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 20, alignItems: "center", gap: 4 },
  summaryLabel: { fontSize: 12 },
  summaryAmount: { fontSize: 18, fontWeight: "bold" },

  // Balance card
  balanceCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  balanceAmount: { fontSize: 28, fontWeight: "bold" },
  savingsRateBox: { alignItems: "flex-end" },
  savingsRateLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 },
  savingsRateValue: { fontSize: 26, fontWeight: "bold" },
  savingsHint: { fontSize: 11 },
  biBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  biBarFill: { height: "100%", borderRadius: 4 },
  biBarHint: { fontSize: 11, marginTop: 5, textAlign: "right" },

  // Charts
  chartSection: { padding: 20, borderRadius: 24, marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 14 },
  chartStyle: { borderRadius: 12 },
  emptyChart: { alignItems: "center", justifyContent: "center", height: 120, gap: 10 },
  emptyChartText: { fontSize: 13 },

  // Pie legend
  legendContainer: { marginTop: 10, gap: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13 },
  legendPct: { fontSize: 12, width: 35, textAlign: "right" },
  legendAmount: { fontSize: 12, width: 65, textAlign: "right", fontWeight: "600" },

  // Insights
  insightsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  insightCard: { flex: 1, padding: 14, borderRadius: 18, alignItems: "center", gap: 4 },
  insightValue: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
  insightLabel: { fontSize: 10, textAlign: "center" },

  // Metas / Deudas sections
  section: { padding: 20, borderRadius: 24, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", flex: 1 },
  sectionBadge: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  progressBg: { height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 5 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12 },
  deudaPendienteBox: { marginTop: 10, padding: 10, borderRadius: 10, alignItems: "center" },
  deudaPendienteText: { fontWeight: "bold", fontSize: 14 },

  // Empty state
  emptySection: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "bold" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
