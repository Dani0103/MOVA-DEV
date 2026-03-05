import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MovimientosScreen({
  movimientos = [],
  loading,
  navigation,
  onRefresh,
}) {
  console.log("🚀 ~ MovimientosScreen ~ movimientos:", movimientos);
  // 🔹 Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Fecha desconocida";
    const fecha = new Date(fechaString);

    // Opciones para mostrar "5 de marzo"
    const opcionesFecha = { day: "numeric", month: "long" };
    const fechaFormateada = fecha.toLocaleDateString("es-ES", opcionesFecha);

    // Opciones para mostrar la hora "15:56"
    const opcionesHora = { hour: "2-digit", minute: "2-digit" };
    const horaFormateada = fecha.toLocaleTimeString("es-ES", opcionesHora);

    return `${fechaFormateada}, ${horaFormateada}`;
  };

  const ingresos = movimientos
    .filter((m) => m?.tipo === "ingreso")
    .reduce((acc, m) => acc + (Number(m?.monto) || 0), 0);

  const gastos = movimientos
    .filter((m) => m?.tipo === "gasto")
    .reduce((acc, m) => acc + (Number(m?.monto) || 0), 0);

  if (loading && movimientos.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#38BDF8"
          />
        }
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Mes</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.labelSmall}>Ingresos</Text>
              <Text style={styles.income}>
                +$ {(ingresos || 0).toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.labelSmall}>Gastos</Text>
              <Text style={styles.expense}>
                -$ {(gastos || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historial</Text>

        {movimientos.length > 0 ? (
          [...movimientos]
            .sort((a, b) => {
              const fechaA = new Date(a.creado_en || a.fecha).getTime();
              const fechaB = new Date(b.creado_en || b.fecha).getTime();
              return fechaB - fechaA;
            })
            .map((mov) => (
              <View key={mov.id} style={styles.transaction}>
                <View>
                  <Text style={styles.transactionText}>
                    {mov.descripcion || "Sin descripción"}
                  </Text>
                  <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>
                      {mov.tipo === "ingreso" ? "Entrada" : "Salida"}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text
                    style={
                      mov.tipo === "ingreso" ? styles.income : styles.expense
                    }
                  >
                    {mov.tipo === "ingreso" ? "+" : "-"} $
                    {Number(mov.monto || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.metaText}>
                    {formatearFecha(mov.creado_en || mov.fecha)}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No hay movimientos todavía</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ... (Tu botón flotante sigue igual) ... */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.fab}
        onPress={() => navigation.navigate("CrearMovimiento")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 10,
  },
  summaryCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryTitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelSmall: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 4,
  },
  income: {
    color: "#4ADE80",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "right",
  },
  expense: {
    color: "#F87171",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "right",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  transaction: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#64748B",
    marginTop: 10,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#38BDF8",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaDot: {
    color: "#64748B",
    fontSize: 10,
    marginHorizontal: 4,
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
  },
});
