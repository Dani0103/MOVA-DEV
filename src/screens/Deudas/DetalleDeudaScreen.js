import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { loadDeudas, deleteDeuda } from "../../services/DeudaService";
import { universalAlert } from "../../utils/universalAlert";

export default function DetalleDeudaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { deuda: initialDeuda } = route.params || { deuda: null };
  const [deuda, setDeuda] = useState(initialDeuda);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEliminar = () => {
    universalAlert(
      "Eliminar Deuda",
      `¿Estás seguro de que quieres eliminar la deuda con "${deuda.acreedor}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteDeuda(token, deuda.id);
              navigation.goBack();
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo eliminar la deuda.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Refresca la deuda cada vez que la pantalla toma foco (ej: al volver de pago)
  useFocusEffect(
    useCallback(() => {
      if (!initialDeuda?.id) return;
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const todas = await loadDeudas(token);
          const fresca = todas.find((d) => d.id === initialDeuda.id);
          if (active && fresca) setDeuda(fresca);
        } catch (_) {
          // mantiene datos anteriores si falla
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [token, initialDeuda?.id])
  );

  if (!deuda) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const saldoPendiente = deuda.saldo_pendiente;
  const progreso = deuda.monto_total > 0 ? (deuda.abonado / deuda.monto_total) * 100 : 0;
  const isPagada = deuda.estado === "pagada" || saldoPendiente <= 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle de Deuda</Text>
        <View style={styles.headerActions}>
          {loading || deleting
            ? <ActivityIndicator size="small" color={theme.primary} />
            : (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditarDeuda", { deuda })}
                  style={[styles.iconBtn, { backgroundColor: theme.card }]}
                >
                  <Ionicons name="pencil-outline" size={18} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEliminar}
                  style={[styles.iconBtn, { backgroundColor: theme.card }]}
                >
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </TouchableOpacity>
              </>
            )
          }
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Principal */}
        <View style={styles.mainInfoCard}>
          <View style={[styles.iconContainer, { backgroundColor: deuda.color + "20" }]}>
            <Ionicons name={deuda.icono} size={50} color={deuda.color} />
          </View>
          <Text style={[styles.acreedorTitle, { color: theme.text }]}>{deuda.acreedor}</Text>
          <Text style={[styles.totalSubtitle, { color: theme.textSecondary }]}>
            Deuda Inicial: $ {deuda.monto_total.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
          </Text>
          {isPagada && (
            <View style={styles.pagadaBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
              <Text style={styles.pagadaText}>Pagada</Text>
            </View>
          )}
        </View>

        {/* Barra de progreso */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Saldo Pendiente</Text>
          <Text style={[styles.balanceAmount, { color: isPagada ? "#4ADE80" : deuda.color }]}>
            $ {saldoPendiente.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
          </Text>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardSecondary }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progreso, 100)}%`, backgroundColor: isPagada ? "#4ADE80" : deuda.color },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {progreso.toFixed(1)}% pagado
          </Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Abonado</Text>
            <Text style={[styles.statValue, { color: "#4ADE80" }]}>
              $ {deuda.abonado.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Tasa Interés</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {deuda.tasa_interes ? `${deuda.tasa_interes}% anual` : "N/A"}
            </Text>
          </View>
        </View>

        {(deuda.fecha_inicio || deuda.descripcion) && (
          <View style={[styles.statsGrid, { marginTop: -10 }]}>
            {deuda.fecha_inicio ? (
              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Inicio de deuda</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {new Date(deuda.fecha_inicio + "T00:00:00").toLocaleDateString("es-ES", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </Text>
              </View>
            ) : <View style={{ flex: 1 }} />}
            {deuda.descripcion ? (
              <View style={[styles.statBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Nota</Text>
                <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={2}>
                  {deuda.descripcion}
                </Text>
              </View>
            ) : <View style={{ flex: 1 }} />}
          </View>
        )}

        {/* Desglose de Cuotas */}
        {deuda.numero_cuotas != null && deuda.numero_cuotas > 0 && (
          <View style={[styles.cuotasCard, { backgroundColor: theme.card }]}>
            {/* Header: título + badge al día / atrasado */}
            <View style={styles.cuotasCardHeader}>
              <Text style={[styles.cuotasSectionTitle, { color: theme.textSecondary }]}>
                Plan de Cuotas
              </Text>
              {deuda.al_dia === true && !isPagada && (
                <View style={styles.alDiaBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#4ADE80" />
                  <Text style={styles.alDiaText}>Al día</Text>
                </View>
              )}
              {deuda.al_dia === false && deuda.cuotas_atrasadas > 0 && (
                <View style={styles.atrasadoBadge}>
                  <Ionicons name="alert-circle" size={13} color="#FB923C" />
                  <Text style={styles.atrasadoText}>
                    {deuda.cuotas_atrasadas} cuota{deuda.cuotas_atrasadas !== 1 ? "s" : ""} atrasada{deuda.cuotas_atrasadas !== 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Cuota mensual + badge cuotas pagadas/total */}
            <View style={styles.cuotaMensualRow}>
              <View>
                <Text style={[styles.cuotaMensualLabel, { color: theme.textMuted }]}>Cuota mensual</Text>
                <Text style={[styles.cuotaMensualValue, { color: deuda.color }]}>
                  $ {(deuda.cuota_mensual || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View style={[styles.cuotaBadge, { backgroundColor: deuda.color + "20" }]}>
                <Text style={[styles.cuotaBadgeText, { color: deuda.color }]}>
                  {deuda.cuotas_pagadas}/{deuda.numero_cuotas}
                </Text>
                <Text style={[styles.cuotaBadgeSub, { color: deuda.color }]}>pagadas</Text>
              </View>
            </View>

            {/* Contexto de mes actual si hay fecha_inicio */}
            {deuda.cuota_actual != null && !isPagada && (
              <View style={[styles.mesActualRow, { backgroundColor: theme.background }]}>
                <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.mesActualText, { color: theme.textSecondary }]}>
                  Mes {deuda.meses_transcurridos + 1} · Cuota {deuda.cuota_actual} de {deuda.numero_cuotas}
                  {deuda.cuotas_esperadas > 0
                    ? `  ·  ${deuda.cuotas_esperadas} debidas`
                    : ""}
                </Text>
              </View>
            )}

            {/* Barra de cuotas pagadas */}
            <View style={[styles.cuotasBarBg, { backgroundColor: theme.cardSecondary }]}>
              <View
                style={[
                  styles.cuotasBarFill,
                  {
                    width: `${Math.min((deuda.cuotas_pagadas / deuda.numero_cuotas) * 100, 100)}%`,
                    backgroundColor: isPagada ? "#4ADE80" : deuda.color,
                  },
                ]}
              />
              {/* Marcador de cuotas esperadas (línea vertical) */}
              {deuda.cuotas_esperadas > 0 && deuda.cuotas_esperadas < deuda.numero_cuotas && !isPagada && (
                <View
                  style={[
                    styles.cuotasBarMark,
                    { left: `${(deuda.cuotas_esperadas / deuda.numero_cuotas) * 100}%` },
                  ]}
                />
              )}
            </View>
            <Text style={[styles.cuotasRestText, { color: theme.textMuted }]}>
              {isPagada
                ? "Todas las cuotas pagadas ✓"
                : `${deuda.cuotas_restantes ?? deuda.numero_cuotas - deuda.cuotas_pagadas} cuota${(deuda.cuotas_restantes ?? 1) !== 1 ? "s" : ""} restante${(deuda.cuotas_restantes ?? 1) !== 1 ? "s" : ""}`}
            </Text>

            {/* Totales */}
            {deuda.total_intereses != null && deuda.total_intereses > 0 && (
              <View style={[styles.totalesRow, { borderTopColor: theme.border }]}>
                <View style={styles.totalItem}>
                  <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Total intereses</Text>
                  <Text style={[styles.totalValue, { color: "#FB923C" }]}>
                    $ {deuda.total_intereses.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View style={[styles.vertDiv, { backgroundColor: theme.border }]} />
                <View style={styles.totalItem}>
                  <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Total a pagar</Text>
                  <Text style={[styles.totalValue, { color: theme.text }]}>
                    $ {(deuda.total_a_pagar || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Botones de Acción */}
        {!isPagada && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: deuda.color }]}
              onPress={() => navigation.navigate("AñadirPagoDeuda", { deuda })}
            >
              <Ionicons name="wallet-outline" size={22} color="white" />
              <Text style={styles.primaryActionText}>Registrar Pago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate("HistorialPagosDeuda", { deuda })}
            >
              <Text style={[styles.secondaryActionText, { color: theme.primary }]}>
                Ver historial de pagos
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isPagada && (
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("HistorialPagosDeuda", { deuda })}
          >
            <Text style={[styles.secondaryActionText, { color: theme.primary }]}>
              Ver historial de pagos
            </Text>
          </TouchableOpacity>
        )}

        {/* Aviso */}
        {!isPagada && (
          <View style={styles.warningCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#FB923C" />
            <Text style={[styles.warningText, { color: theme.textSecondary }]}>
              Recuerda realizar tus pagos a tiempo para evitar intereses por mora.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 12 },
  mainInfoCard: { alignItems: "center", marginVertical: 20 },
  iconContainer: { width: 100, height: 100, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  acreedorTitle: { fontSize: 24, fontWeight: "bold" },
  totalSubtitle: { fontSize: 14, marginTop: 5 },
  pagadaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ADE8020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    marginTop: 8,
  },
  pagadaText: { color: "#4ADE80", fontWeight: "700", fontSize: 12 },
  balanceCard: { padding: 25, borderRadius: 24, marginBottom: 20, alignItems: "center" },
  balanceLabel: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  progressBarBg: { height: 10, borderRadius: 5, width: "100%", overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 5 },
  progressText: { fontSize: 12, marginTop: 10, fontWeight: "600" },
  statsGrid: { flexDirection: "row", gap: 15, marginBottom: 15 },
  statBox: { flex: 1, padding: 15, borderRadius: 16 },
  statLabel: { fontSize: 11, textTransform: "uppercase", marginBottom: 5 },
  statValue: { fontSize: 14, fontWeight: "bold" },
  actionSection: { gap: 12, marginBottom: 20 },
  primaryAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 18, borderRadius: 16, gap: 10 },
  primaryActionText: { color: "white", fontWeight: "bold", fontSize: 16 },
  secondaryAction: { alignItems: "center", padding: 15 },
  secondaryActionText: { fontWeight: "600" },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "rgba(251,146,60,0.1)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(251,146,60,0.2)",
  },
  warningText: { fontSize: 13, flex: 1, lineHeight: 18 },
  // Cuotas card
  cuotasCard: { borderRadius: 20, padding: 18, marginBottom: 15, gap: 10 },
  cuotasCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cuotasSectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  alDiaBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#4ADE8018", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  alDiaText: { fontSize: 11, fontWeight: "700", color: "#4ADE80" },
  atrasadoBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FB923C18", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  atrasadoText: { fontSize: 11, fontWeight: "700", color: "#FB923C" },
  cuotaMensualRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cuotaMensualLabel: { fontSize: 12, marginBottom: 2 },
  cuotaMensualValue: { fontSize: 24, fontWeight: "bold" },
  cuotaBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, alignItems: "center" },
  cuotaBadgeText: { fontSize: 18, fontWeight: "bold" },
  cuotaBadgeSub: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  mesActualRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  mesActualText: { fontSize: 12, flex: 1 },
  cuotasBarBg: { height: 10, borderRadius: 5, overflow: "visible", position: "relative" },
  cuotasBarFill: { height: "100%", borderRadius: 5 },
  cuotasBarMark: { position: "absolute", top: -3, width: 2, height: 16, backgroundColor: "#FB923C", borderRadius: 1 },
  cuotasRestText: { fontSize: 12, textAlign: "right" },
  totalesRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  totalItem: { flex: 1, alignItems: "center" },
  totalLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 },
  totalValue: { fontSize: 15, fontWeight: "700" },
  vertDiv: { width: 1, height: 30, marginHorizontal: 8 },
});
