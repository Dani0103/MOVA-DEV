import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { GetDashboard } from "../services/Dashboard";
import QuickMovementModal from "./Movimientos/QuickMovementModal";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "../context/CategoryContext";
import { useAccounts } from "../context/AccountContext";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const TIPO_ICONS = {
  gasto:        "trending-down-outline",
  ingreso:      "trending-up-outline",
  transferencia:"swap-horizontal-outline",
  prestamo:     "cash-outline",
};

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Construye la lista de meses desde la fecha de registro del usuario hasta el mes actual.
 * Retorna en orden inverso (mes actual primero) para que el filtro arranque por defecto en hoy.
 */
function buildMesesDisponibles(fechaRegistro) {
  const now = new Date();
  const inicio = fechaRegistro ? new Date(fechaRegistro) : now;

  // Si la fecha es invalida, caemos al mes actual
  if (isNaN(inicio.getTime())) {
    return [{ year: now.getFullYear(), month: now.getMonth() }];
  }

  const meses = [];
  let y = now.getFullYear();
  let m = now.getMonth();
  const yIni = inicio.getFullYear();
  const mIni = inicio.getMonth();

  while (y > yIni || (y === yIni && m >= mIni)) {
    meses.push({ year: y, month: m });
    m -= 1;
    if (m < 0) { m = 11; y -= 1; }
  }

  return meses;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function rangoMes(year, month) {
  const desde = `${year}-${pad2(month + 1)}-01`;
  // Ultimo dia del mes: dia 0 del mes siguiente
  const ultimoDia = new Date(year, month + 1, 0).getDate();
  const hasta = `${year}-${pad2(month + 1)}-${pad2(ultimoDia)}`;
  return { desde, hasta };
}

export default function HomeScreen() {
  const theme = useTheme();
  const { isDark } = useThemeContext();
  const { user, token } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    saldoDisponible: 0,
    ingresos: 0,
    gastos: 0,
    ahorro: 0,
    movimientos: [],
  });

  const { categorias, loading: loadingCategorias, refreshCategories } = useCategories();
  const { cuentas, loading: loadingCuentas, refreshAccounts } = useAccounts();

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lista de meses disponibles segun la fecha de registro del usuario
  const mesesDisponibles = useMemo(
    () => buildMesesDisponibles(user?.creado_en),
    [user?.creado_en]
  );

  // Por defecto: mes actual (primer elemento de la lista)
  const [mesSel, setMesSel] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const fetchData = async (mesObj = mesSel) => {
    try {
      setLoading(true);

      const { desde, hasta } = rangoMes(mesObj.year, mesObj.month);
      const response = await GetDashboard(token, {
        fecha_desde: desde,
        fecha_hasta: hasta,
      });

      // Extraemos el objeto data dentro de la respuesta
      const apiData = response?.data;

      if (apiData) {
        setData({
          // "Saldo Disponible" = patrimonio total en todas las cuentas (apiData.ahorros)
          saldoDisponible: parseFloat(apiData.ahorros || 0),
          ingresos: parseFloat(apiData.ingresos || 0),
          gastos: parseFloat(apiData.gastos || 0),
          // "Ahorro del Mes" = ingresos - gastos del periodo filtrado
          ahorro: parseFloat(apiData.salario_disponible || 0),
          movimientos: Array.isArray(apiData.ultimos_movimientos)
            ? apiData.ultimos_movimientos
            : [],
        });
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(mesSel);
  }, [token, mesSel.year, mesSel.month]);

  useEffect(() => {
    refreshCategories(token, user.id);
    refreshAccounts(token);
  }, [token]);

  const handleSelectMes = (m) => {
    setMesSel(m);
  };

  const esMesActual = (m) => {
    const now = new Date();
    return m.year === now.getFullYear() && m.month === now.getMonth();
  };

  const labelMes = (m) => {
    const now = new Date();
    const esActual = m.year === now.getFullYear() && m.month === now.getMonth();
    if (esActual) return "Este mes";
    const esMismoAnio = m.year === now.getFullYear();
    return esMismoAnio
      ? NOMBRES_MES[m.month].slice(0, 3)
      : `${NOMBRES_MES[m.month].slice(0, 3)} ${String(m.year).slice(-2)}`;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const ahorroPositivo = (data.ahorro || 0) >= 0;
  const ahorroColor = ahorroPositivo ? "#4ADE80" : "#F87171";
  const cuentasActivasCount = Array.isArray(cuentas)
    ? cuentas.filter((c) => c.activa !== false && c.archivada !== true).length
    : 0;
  const mesActualSel = mesesDisponibles.find(
    (m) => m.year === mesSel.year && m.month === mesSel.month
  );
  const tituloMes = mesActualSel
    ? esMesActual(mesActualSel)
      ? "Este mes"
      : `${NOMBRES_MES[mesSel.month]} ${mesSel.year}`
    : "";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* ━━━ HERO: Patrimonio total (no depende del mes) ━━━ */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <View style={styles.heroHeader}>
            <Ionicons name="wallet-outline" size={18} color="rgba(15,23,42,0.7)" />
            <Text style={styles.heroLabel}>Patrimonio total</Text>
          </View>
          <Text style={styles.heroAmount}>
            $ {(data.saldoDisponible || 0).toLocaleString()}
          </Text>
          {cuentasActivasCount > 0 && (
            <Text style={styles.heroFooter}>
              en {cuentasActivasCount} cuenta{cuentasActivasCount === 1 ? "" : "s"} activa{cuentasActivasCount === 1 ? "" : "s"}
            </Text>
          )}
        </View>

        {/* ━━━ Sección: Resumen del mes ━━━ */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitleStrong, { color: theme.text }]}>
            Resumen del mes
          </Text>
          <Text style={[styles.sectionSubtle, { color: theme.textSecondary }]}>
            {tituloMes}
          </Text>
        </View>

        {/* Selector de mes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthSelectorRow}
          style={styles.monthSelectorScroll}
        >
          {mesesDisponibles.map((m) => {
            const isSel = mesSel.year === m.year && mesSel.month === m.month;
            return (
              <TouchableOpacity
                key={`${m.year}-${m.month}`}
                onPress={() => handleSelectMes(m)}
                style={[
                  styles.monthChip,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isSel && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                {esMesActual(m) && (
                  <Ionicons
                    name="ellipse"
                    size={6}
                    color={isSel ? theme.background : "#4ADE80"}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.monthChipText,
                    { color: theme.textSecondary },
                    isSel && { color: theme.background, fontWeight: "700" },
                  ]}
                >
                  {labelMes(m)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Ahorro del mes — destacado, color según signo */}
        <View
          style={[
            styles.savingsHero,
            {
              backgroundColor: theme.card,
              borderLeftColor: ahorroColor,
            },
          ]}
        >
          <View style={styles.savingsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.savingsLabel, { color: theme.textSecondary }]}>
                {ahorroPositivo ? "Ahorraste" : "Excediste"}
              </Text>
              <Text style={[styles.savingsAmountNew, { color: ahorroColor }]}>
                {ahorroPositivo ? "+" : ""}$ {Math.abs(data.ahorro || 0).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.savingsBadge, { backgroundColor: ahorroColor + "20" }]}>
              <Ionicons
                name={ahorroPositivo ? "trending-up" : "trending-down"}
                size={28}
                color={ahorroColor}
              />
            </View>
          </View>
        </View>

        {/* Ingresos vs Gastos lado a lado */}
        <View style={styles.summaryRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: (isDark ? "#4ADE80" : "#16A34A") + "20" }]}>
                <Ionicons
                  name="arrow-down"
                  size={14}
                  color={isDark ? "#4ADE80" : "#16A34A"}
                />
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Ingresos
              </Text>
            </View>
            <Text style={[styles.statValue, { color: isDark ? "#4ADE80" : "#16A34A" }]}>
              $ {(data.ingresos || 0).toLocaleString()}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: (isDark ? "#F87171" : "#DC2626") + "20" }]}>
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color={isDark ? "#F87171" : "#DC2626"}
                />
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Gastos
              </Text>
            </View>
            <Text style={[styles.statValue, { color: isDark ? "#F87171" : "#DC2626" }]}>
              $ {(data.gastos || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Sección de movimientos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Últimos Movimientos</Text>
          </View>

          {data.movimientos.length > 0 ? (
            data.movimientos.map((item) => {
              const catColor  = item.categoria?.color_hex ?? item.cuenta_origen?.color_hex ?? theme.primary;
              const iconName  = item.categoria?.icono
                ? `${item.categoria.icono}-outline`
                : TIPO_ICONS[item.tipo] ?? "swap-horizontal-outline";
              const isIngreso = item.tipo === "ingreso";
              const amountColor = isIngreso ? "#4ADE80" : "#F87171";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.transactionCard, { backgroundColor: theme.card }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("Movimientos", {
                    screen: "DetalleMovimiento",
                    // timestamp fuerza a React Navigation a detectar el cambio de params
                    // aunque el componente ya estuviera montado en el stack
                    params: { movimiento: item, _ts: Date.now() },
                  })}
                >
                  {/* Icono con color de categoría */}
                  <View style={[styles.iconCircle, { backgroundColor: catColor + "22" }]}>
                    <Ionicons name={iconName} size={20} color={catColor} />
                  </View>

                  {/* Info central */}
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.categoryName, { color: theme.text }]} numberOfLines={1}>
                      {item.categoria?.nombre ?? item.tipo}
                    </Text>

                    {/* Descripción — línea nueva */}
                    {!!item.descripcion && (
                      <Text style={[styles.descriptionText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.descripcion}
                      </Text>
                    )}

                    <Text style={[styles.detailsText, { color: theme.textMuted }]}>
                      {item.cuenta_origen?.nombre ?? "—"} •{" "}
                      {new Date(item.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Text>
                  </View>

                  {/* Monto */}
                  <View style={styles.amountContainer}>
                    <Text style={[styles.amountText, { color: amountColor }]}>
                      {isIngreso ? "+" : "-"}$
                      {Math.abs(parseFloat(item.monto)).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                      })}
                    </Text>
                    {item.cuenta_origen?.moneda?.codigo ? (
                      <Text style={[styles.currencyCode, { color: theme.textMuted }]}>
                        {item.cuenta_origen.moneda.codigo}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={40} color={theme.border} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No hay movimientos registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <QuickMovementModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        cuentas={cuentas}
        categorias={categorias}
        loadingCuentas={loadingCuentas}
        loadingCategorias={loadingCategorias}
        onSuccess={() => fetchData(mesSel)}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="flash" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  // ━━━ HERO Patrimonio ━━━
  heroCard: {
    padding: 22,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(15,23,42,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  heroFooter: {
    fontSize: 12,
    color: "rgba(15,23,42,0.6)",
    marginTop: 4,
    fontWeight: "500",
  },

  // ━━━ Encabezados de sección ━━━
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitleStrong: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtle: {
    fontSize: 13,
    fontWeight: "500",
  },

  // ━━━ Selector de mes ━━━
  monthSelectorScroll: {
    marginBottom: 16,
  },
  monthSelectorRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
  },
  monthChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ━━━ Ahorro del mes (destacado) ━━━
  savingsHero: {
    padding: 18,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  savingsAmountNew: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  savingsBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  // ━━━ Stats Ingresos/Gastos ━━━
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  transaction: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionText: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAll: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  detailsText: {
    fontSize: 11,
    marginTop: 1,
  },
  amountContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
  },
  currencyCode: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    bottom: 30, // Distancia desde abajo
    right: 25, // Distancia desde la derecha
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    // Sombra para iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    // Sombra para Android
    elevation: 8,
    zIndex: 999, // Asegura que esté por encima de todo
  },
});
