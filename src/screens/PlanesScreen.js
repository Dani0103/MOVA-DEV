import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { MyTypePlans, TypePlans } from "../services/CatalogoService";
import { universalAlert } from "../utils/universalAlert";
import { useTheme } from "../theme/useTheme";

export default function PlanesScreen({ navigation }) {
  const theme = useTheme();
  const { token } = useAuth();
  const [planes, setPlanes] = useState([]);
  const [miPlan, setMiPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPlanes();
  }, []);

  const obtenerPlanes = async () => {
    try {
      setLoading(true);
      const [responsePlanes, responseMiPlan] = await Promise.all([
        TypePlans(token),
        MyTypePlans(token),
      ]);

      if (responsePlanes?.data) {
        setPlanes(responsePlanes.data);
      }

      if (responseMiPlan?.data) {
        setMiPlan(responseMiPlan.data);
      }
    } catch (error) {
      console.error("Error al obtener planes:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de los planes.");
    } finally {
      setLoading(false);
    }
  };

  // MANEJADOR DE MANTENIMIENTO
  const handlePlanAction = (planNombre) => {
    universalAlert(
      "Módulo en Mantenimiento 🛠️",
      `Estamos actualizando nuestra pasarela de pagos para ofrecerte una mejor experiencia al adquirir el plan ${planNombre}.\n\nPor favor, intenta de nuevo más tarde.`,
      [{ text: "Entendido", style: "default" }],
    );
  };

  const renderFeatures = (plan) => {
    const { configuracion } = plan;
    const isFree = plan.id === 1;

    const features = [
      { text: `Hasta ${configuracion.limite_cuentas} cuentas`, included: true },
      { text: "Registros ilimitados", included: true },
      { text: "Soporte Cripto", included: configuracion.permite_crypto },
      { text: "Metas de ahorro", included: !isFree },
      { text: "Estadísticas avanzadas", included: !isFree },
    ];

    return features.map((feature, index) => (
      <View key={index} style={styles.featureItem}>
        <Ionicons
          name={feature.included ? "checkmark-circle" : "close-circle"}
          size={20}
          color={
            feature.included
              ? plan.id !== 1
                ? "#F59E0B"
                : "#10B981"
              : "#475569"
          }
        />
        <Text
          style={[
            styles.featureText,
            { color: theme.text },
            !feature.included && styles.featureTextDisabled,
          ]}
        >
          {feature.text}
        </Text>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>
          Cargando planes...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Planes y Precios</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Elige el plan que mejor se adapte a tus necesidades financieras.
      </Text>

      {planes.map((plan) => {
        const isCurrentPlan = miPlan?.id === plan.id;
        const isPremiumStyle = plan.id !== 1;

        return (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              { backgroundColor: theme.card },
              isPremiumStyle && styles.premiumCard,
              isCurrentPlan && styles.activePlanBorder,
            ]}
          >
            {isCurrentPlan && (
              <View style={styles.currentBadge}>
                <Text style={[styles.currentBadgeText, { color: theme.background }]}>Tu plan actual</Text>
              </View>
            )}

            {isPremiumStyle && !isCurrentPlan && (
              <View style={styles.popularBadge}>
                <Text style={[styles.popularBadgeText, { color: theme.background }]}>Recomendado</Text>
              </View>
            )}

            <View style={styles.premiumHeader}>
              {isPremiumStyle && (
                <Ionicons name="star" size={24} color="#F59E0B" />
              )}
              <Text
                style={[
                  styles.planName,
                  { color: theme.text },
                  isPremiumStyle && styles.premiumPlanName,
                ]}
              >
                {plan.nombre}
              </Text>
            </View>

            <Text style={[styles.planPrice, { color: theme.text }]}>
              ${parseFloat(plan.precio).toLocaleString()}
              <Text style={[styles.planPeriod, { color: theme.textSecondary }]}>/ mes</Text>
            </Text>

            <Text style={[styles.planDescription, { color: theme.textSecondary }]}>
              {isPremiumStyle
                ? "El control total para alcanzar tus metas más rápido."
                : "Para empezar a organizar tus finanzas personales."}
            </Text>

            <View style={[styles.featuresList, { borderTopColor: theme.border }]}>{renderFeatures(plan)}</View>

            {!isCurrentPlan && (
              <TouchableOpacity
                style={
                  isPremiumStyle ? styles.upgradeActionBtn : [styles.downgradeBtn, { backgroundColor: theme.background, borderColor: theme.border }]
                }
                onPress={() => handlePlanAction(plan.nombre)}
              >
                <Text
                  style={
                    isPremiumStyle
                      ? [styles.upgradeActionBtnText, { color: theme.background }]
                      : [styles.downgradeBtnText, { color: theme.textSecondary }]
                  }
                >
                  {isPremiumStyle
                    ? `Mejorar a ${plan.nombre}`
                    : "Cambiar al plan Básico"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  planCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  premiumCard: { borderColor: "#F59E0B40" },
  activePlanBorder: { borderColor: "#38BDF8" },
  currentBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#38BDF8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  currentBadgeText: { fontSize: 12, fontWeight: "bold" },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: { fontSize: 12, fontWeight: "bold" },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 8,
  },
  premiumPlanName: { color: "#F59E0B", fontSize: 22, fontWeight: "bold" },
  planPrice: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
  },
  planPeriod: { fontSize: 16, fontWeight: "normal" },
  planDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    borderTopWidth: 1,
    paddingTop: 20,
    gap: 12,
  },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 15 },
  featureTextDisabled: { color: "#64748B", textDecorationLine: "line-through" },
  downgradeBtn: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  downgradeBtnText: { fontWeight: "bold", fontSize: 16 },
  upgradeActionBtn: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  upgradeActionBtnText: { fontWeight: "bold", fontSize: 16 },
  footerSpacer: { height: 40 },
});
