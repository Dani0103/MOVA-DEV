import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { loadMetas, deleteMeta } from "../../services/MetasService";
import { universalAlert } from "../../utils/universalAlert";

const { width } = Dimensions.get("window");

export default function DetalleMetaScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  // Seed with what we received so the screen renders immediately
  const { meta: initialMeta } = route.params || { meta: null };
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEliminar = () => {
    universalAlert(
      "Eliminar Meta",
      `¿Estás seguro de que quieres eliminar "${meta.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteMeta(token, meta.id);
              navigation.goBack();
            } catch (e) {
              universalAlert("Error", e.message || "No se pudo eliminar la meta.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Reload the meta every time this screen gets focus (e.g. back from AddAhorro)
  useFocusEffect(
    useCallback(() => {
      if (!initialMeta?.id) return;
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const todas = await loadMetas(token);
          const fresca = todas.find((m) => m.id === initialMeta.id);
          if (active && fresca) setMeta(fresca);
        } catch (_) {
          // Keep showing stale data if refresh fails
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [token, initialMeta?.id])
  );

  if (!meta) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const progreso = (meta.actual / meta.objetivo) * 100;
  const faltante = Math.max(meta.objetivo - meta.actual, 0);

  // ── Dynamic tip ──────────────────────────────────────────────────────────────
  let tipText = null;
  if (faltante <= 0) {
    tipText = "¡Felicitaciones! Has alcanzado tu meta 🎉 Considera crear una nueva.";
  } else if (meta.fecha_limite) {
    const hoy = new Date();
    const limite = new Date(meta.fecha_limite);
    const diffMs = limite - hoy;
    const mesesRestantes = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44)), 1);
    const ahorroPorMes = Math.ceil(faltante / mesesRestantes);
    tipText = `Si ahorras $ ${ahorroPorMes.toLocaleString("es-CO")} cada mes, alcanzarás tu meta en ${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"}.`;
  } else {
    const ahorroPorMes = Math.ceil(faltante / 12);
    tipText = `Si ahorras $ ${ahorroPorMes.toLocaleString("es-CO")} cada mes, alcanzarás tu meta en 12 meses.`;
  }
  // ─────────────────────────────────────────────────────────────────────────────

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Progreso de Meta</Text>
        <View style={styles.headerActions}>
          {loading || deleting
            ? <ActivityIndicator size="small" color={theme.primary} />
            : (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditarMeta", { meta })}
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
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: meta.color + "20" },
            ]}
          >
            <Ionicons name={meta.icono} size={50} color={meta.color} />
          </View>
          <Text style={[styles.metaTitle, { color: theme.text }]}>{meta.nombre}</Text>
          <Text style={[styles.metaSubtitle, { color: theme.textSecondary }]}>
            Objetivo: $ {meta.objetivo.toLocaleString()}
          </Text>
        </View>

        {/* Visual de Progreso Circular o Barra Grande */}
        <View style={[styles.progressSection, { backgroundColor: theme.card }]}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.cardSecondary }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progreso, 100)}%`,
                  backgroundColor: meta.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.percentageText, { color: theme.text }]}>{progreso.toFixed(1)}%</Text>
            <Text style={[styles.remainingText, { color: theme.textSecondary }]}>
              Faltan $ {faltante.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Resumen de Datos */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Ahorrado</Text>
            <Text style={[styles.statValue, { color: meta.color }]}>
              $ {meta.actual.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Fecha Meta</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {meta.fecha_limite || "Sin fecha"}
            </Text>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: meta.color }]}
            onPress={() => navigation.navigate("AñadirAhorro", { meta })}
          >
            <Ionicons name="add-circle" size={22} color={theme.background} />
            <Text style={[styles.primaryActionText, { color: theme.background }]}>Añadir Ahorro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate("HistorialAportes", { meta })}
          >
            <Text style={[styles.secondaryActionText, { color: theme.primary }]}>Historial de aportes</Text>
          </TouchableOpacity>
        </View>

        {/* Tip dinámico */}
        <View style={styles.tipCard}>
          <Ionicons
            name={faltante <= 0 ? "checkmark-circle-outline" : "bulb-outline"}
            size={20}
            color={faltante <= 0 ? "#4ADE80" : "#FACC15"}
          />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            {tipText}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: { padding: 8, borderRadius: 12 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 12 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  mainInfoCard: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  metaTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  metaSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  progressSection: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  remainingText: {
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  actionSection: {
    gap: 12,
    marginBottom: 20,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  primaryActionText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryAction: {
    alignItems: "center",
    padding: 15,
  },
  secondaryActionText: {
    fontWeight: "600",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.2)",
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
