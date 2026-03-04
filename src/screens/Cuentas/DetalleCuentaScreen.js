import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { universalAlert } from "../../utils/universalAlert"; // Asumiendo que usas este utilitario
import { ArchiveAccount } from "../../services/CuentaService";
import { useAuth } from "../../context/AuthContext";

export default function DetalleCuentaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  // Extraemos la cuenta que viene de la navegación (desde la lista de cuentas)
  const { cuenta } = route.params;

  // Estos movimientos los traerás luego de la API
  const movimientos = [
    // { id: 1, descripcion: "Salario", tipo: "ingreso", monto: 3000000 },
    // { id: 2, descripcion: "Mercado", tipo: "gasto", monto: 320000 },
    // { id: 3, descripcion: "Netflix", tipo: "gasto", monto: 45000 },
  ];

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, m) => acc + m.monto, 0);

  // Función para manejar el botón de Editar
  const handleEditar = () => {
    // Navegamos a CrearCuentaScreen y le pasamos el objeto 'cuenta' entero
    navigation.navigate("CrearCuenta", { cuenta: cuenta });
  };

  // Función para manejar el botón de Archivar
  const handleArchivar = () => {
    universalAlert(
      "¿Archivar cuenta?",
      "La cuenta dejará de estar activa y no se sumará al saldo total, pero podrás consultar sus movimientos históricos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Archivar",
          style: "destructive",
          onPress: () => {
            console.log("Cuenta archivada:", cuenta.id);

            ArchiveAccount(cuenta.nombre, token);
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <ScrollView style={styles.container}>
        {/* TopBar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Detalle de cuenta</Text>

          {/* Botón de Editar en la TopBar */}
          <TouchableOpacity onPress={handleEditar} style={styles.editBtnTop}>
            <Ionicons name="pencil" size={18} color="#38BDF8" />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal con color dinámico */}
        <View
          style={[
            styles.balanceCard,
            {
              borderTopColor: cuenta.color_hex || "#38BDF8",
              borderTopWidth: 4,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.accountName}>{cuenta.nombre}</Text>
              <Text style={styles.accountType}>
                {cuenta.tipo_cuenta?.nombre || "General"}
              </Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>
              {cuenta.moneda?.simbolo || "$"}{" "}
              {parseFloat(cuenta.saldo_actual).toLocaleString()}
            </Text>
            <Text style={styles.currencyBadge}>{cuenta.moneda?.codigo}</Text>
          </View>
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryRow}>
          <View style={styles.incomeCard}>
            <Ionicons name="trending-up" size={16} color="#4ADE80" />
            <Text style={styles.summaryTitle}>Ingresos</Text>
            <Text style={styles.income}>
              + {cuenta.moneda?.simbolo} {ingresos.toLocaleString()}
            </Text>
          </View>

          <View style={styles.expenseCard}>
            <Ionicons name="trending-down" size={16} color="#F87171" />
            <Text style={styles.summaryTitle}>Gastos</Text>
            <Text style={styles.expense}>
              - {cuenta.moneda?.simbolo} {gastos.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Movimientos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          {movimientos.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.viewAll}>Ver todo</Text>
            </TouchableOpacity>
          )}
        </View>

        {movimientos.length > 0 ? (
          movimientos.map((mov) => (
            <View key={mov.id} style={styles.transaction}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    mov.tipo === "ingreso"
                      ? "add-circle-outline"
                      : "remove-circle-outline"
                  }
                  size={24}
                  color={mov.tipo === "ingreso" ? "#4ADE80" : "#F87171"}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.transactionText}>{mov.descripcion}</Text>
                <Text style={styles.transactionDate}>Hoy, 10:30 AM</Text>
              </View>

              <Text
                style={mov.tipo === "ingreso" ? styles.income : styles.expense}
              >
                {mov.tipo === "ingreso" ? "+" : "-"}
                {cuenta.moneda?.simbolo}
                {mov.monto.toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyTransactionsContainer}>
            <Ionicons name="receipt-outline" size={40} color="#1E293B" />
            <Text style={styles.emptyTransactionsText}>
              Aún no hay movimientos en esta cuenta.
            </Text>
          </View>
        )}

        {/* --- NUEVO: Espaciador y Botón Archivar al final --- */}
        <View style={{ height: 30 }} />

        <TouchableOpacity style={styles.archiveBtn} onPress={handleArchivar}>
          <Ionicons name="archive-outline" size={20} color="#F87171" />
          <Text style={styles.archiveText}>Archivar Cuenta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        {/* --------------------------------------------------- */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  // NUEVOS ESTILOS PARA LOS BOTONES
  editBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: "#334155",
  },
  editText: {
    color: "#38BDF8",
    fontWeight: "600",
    fontSize: 14,
  },
  archiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248, 113, 113, 0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
    marginHorizontal: 10,
  },
  archiveText: {
    color: "#F87171",
    fontWeight: "600",
    fontSize: 15,
  },
  // ESTILOS ANTERIORES
  topTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  balanceCard: {
    backgroundColor: "#1E293B",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  accountName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  accountType: {
    color: "#94A3B8",
    fontSize: 14,
  },
  balanceLabel: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 5,
  },
  balance: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  currencyBadge: {
    color: "#38BDF8",
    fontWeight: "bold",
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  incomeCard: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 16,
    width: "48%",
    borderLeftWidth: 3,
    borderLeftColor: "#4ADE80",
  },
  expenseCard: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 16,
    width: "48%",
    borderLeftWidth: 3,
    borderLeftColor: "#F87171",
  },
  summaryTitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 5,
  },
  income: {
    color: "#4ADE80",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 2,
  },
  expense: {
    color: "#F87171",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  viewAll: {
    color: "#38BDF8",
    fontSize: 14,
  },
  transaction: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  transactionDate: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  emptyTransactionsContainer: {
    backgroundColor: "#1E293B",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyTransactionsText: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
