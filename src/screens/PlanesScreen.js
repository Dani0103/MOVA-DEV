import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function PlanesScreen({ navigation }) {
  const { user } = useAuth();
  const isFreePlan = user?.plan?.id === 1;

  // Beneficios de cada plan
  const planGratisFeatures = [
    { text: "Hasta 5 cuentas", included: true },
    { text: "Registros ilimitados", included: true },
    { text: "Metas de ahorro", included: false },
    { text: "Gestión de deudas", included: false },
    { text: "Estadísticas avanzadas", included: false },
  ];

  const planPremiumFeatures = [
    { text: "Cuentas ilimitadas", included: true },
    { text: "Registros ilimitados", included: true },
    { text: "Metas de ahorro", included: true },
    { text: "Gestión de deudas", included: true },
    { text: "Estadísticas avanzadas", included: true },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planes y Precios</Text>
      </View>

      <Text style={styles.subtitle}>
        Elige el plan que mejor se adapte a tus necesidades financieras.
      </Text>

      {/* TARJETA PLAN GRATIS */}
      <View style={[styles.planCard, isFreePlan && styles.activePlanBorder]}>
        {isFreePlan && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Tu plan actual</Text>
          </View>
        )}
        <Text style={styles.planName}>Básico</Text>
        <Text style={styles.planPrice}>
          $0 <Text style={styles.planPeriod}>/ mes</Text>
        </Text>
        <Text style={styles.planDescription}>
          Para empezar a organizar tus finanzas personales.
        </Text>

        <View style={styles.featuresList}>
          {planGratisFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name={feature.included ? "checkmark-circle" : "close-circle"}
                size={20}
                color={feature.included ? "#10B981" : "#475569"}
              />
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureTextDisabled,
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {!isFreePlan && (
          <TouchableOpacity style={styles.downgradeBtn}>
            <Text style={styles.downgradeBtnText}>Cambiar al plan Básico</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TARJETA PLAN PREMIUM */}
      <View
        style={[
          styles.planCard,
          styles.premiumCard,
          !isFreePlan && styles.activePlanBorder,
        ]}
      >
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Recomendado</Text>
        </View>
        <View style={styles.premiumHeader}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <Text style={styles.premiumPlanName}>Premium</Text>
        </View>

        {/* Reemplaza $X.XX por tu precio real */}
        <Text style={styles.planPrice}>
          $4.99 <Text style={styles.planPeriod}>/ mes</Text>
        </Text>
        <Text style={styles.planDescription}>
          El control total para alcanzar tus metas más rápido.
        </Text>

        <View style={styles.featuresList}>
          {planPremiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#F59E0B" // Color dorado para los checks premium
              />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.upgradeActionBtn}
          onPress={() => console.log("Procesar pago...")}
        >
          <Text style={styles.upgradeActionBtnText}>Mejorar a Premium</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  contentContainer: {
    padding: 20,
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
    backgroundColor: "#1E293B",
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  premiumCard: {
    backgroundColor: "#1E293B",
    borderColor: "#F59E0B40", // Borde sutil dorado por defecto
  },
  activePlanBorder: {
    borderColor: "#38BDF8", // Borde azul claro si es el plan actual
  },
  currentBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#38BDF8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "bold",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "bold",
  },
  planName: {
    color: "white",
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
  premiumPlanName: {
    color: "#F59E0B",
    fontSize: 22,
    fontWeight: "bold",
  },
  planPrice: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
  },
  planPeriod: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "normal",
  },
  planDescription: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    color: "white",
    fontSize: 15,
  },
  featureTextDisabled: {
    color: "#64748B",
    textDecorationLine: "line-through",
  },
  downgradeBtn: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  downgradeBtnText: {
    color: "#94A3B8",
    fontWeight: "bold",
    fontSize: 16,
  },
  upgradeActionBtn: {
    marginTop: 25,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  upgradeActionBtnText: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerSpacer: {
    height: 40,
  },
});
