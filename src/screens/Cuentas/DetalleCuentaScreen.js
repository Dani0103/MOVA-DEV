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
import { useTheme } from "../../theme/useTheme";

export default function DetalleCuentaScreen() {
  const theme = useTheme();
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

            ArchiveAccount(cuenta.id, token);
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={styles.container}>
        {/* TopBar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: theme.text }]}>Detalle de cuenta</Text>

          {/* Botón de Editar en la TopBar */}
          <TouchableOpacity onPress={handleEditar} style={[styles.editBtnTop, { borderColor: theme.border }]}>
            <Ionicons name="pencil" size={18} color="#38BDF8" />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal con color dinámico */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.card },
            {
              borderTopColor: cuenta.color_hex || theme.primary,
              borderTopWidth: 4,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.accountName, { color: theme.text }]}>{cuenta.nombre}</Text>
              <Text style={[styles.accountType, { color: theme.textSecondary }]}>
                {cuenta.tipo_cuenta?.nombre || "General"}
              </Text>
            </View>
          </View>

          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Saldo Disponible</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balance, { color: theme.text }]}>
              {cuenta.moneda?.simbolo || "$"}{" "}
              {parseFloat(cuenta.saldo_actual).toLocaleString()}
            </Text>
            <Text style={[styles.currencyBadge, { color: theme.primary }]}>{cuenta.moneda?.codigo}</Text>
          </View>
        </View>

        {/* Resumen mensual */}
        <View style={styles.summaryRow}>
          <View style={[styles.incomeCard, { backgroundColor: theme.card }]}>
            <Ionicons name="trending-up" size={16} color="#4ADE80" />
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>Ingresos</Text>
            <Text style={styles.income}>
              + {cuenta.moneda?.simbolo} {ingresos.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.expenseCard, { backgroundColor: theme.card }]}>
            <Ionicons name="trending-down" size={16} color="#F87171" />
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>Gastos</Text>
            <Text style={styles.expense}>
              - {cuenta.moneda?.simbolo} {gastos.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Movimientos */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Movimientos recientes</Text>
          {movimientos.length > 0 && (
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: theme.primary }]}>Ver todo</Text>
            </TouchableOpacity>
          )}
        </View>

        {movimientos.length > 0 ? (
          movimientos.map((mov) => (
            <View key={mov.id} style={[styles.transaction, { backgroundColor: theme.card }]}>
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
                <Text style={[styles.transactionText, { color: theme.text }]}>{mov.descripcion}</Text>
                <Text style={[styles.transactionDate, { color: theme.textMuted }]}>Hoy, 10:30 AM</Text>
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
          <View style={[styles.emptyTransactionsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={40} color={theme.card} />
            <Text style={[styles.emptyTransactionsText, { color: theme.textMuted }]}>
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
  },
  // NUEVOS ESTILOS PARA LOS BOTONES
  editBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
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
    fontSize: 18,
    fontWeight: "700",
  },
  balanceCard: {
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
    fontSize: 22,
    fontWeight: "bold",
  },
  accountType: {
    fontSize: 14,
  },
  balanceLabel: {
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
  },
  currencyBadge: {
    fontWeight: "bold",
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  incomeCard: {
    padding: 15,
    borderRadius: 16,
    width: "48%",
    borderLeftWidth: 3,
    borderLeftColor: "#4ADE80",
  },
  expenseCard: {
    padding: 15,
    borderRadius: 16,
    width: "48%",
    borderLeftWidth: 3,
    borderLeftColor: "#F87171",
  },
  summaryTitle: {
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
    fontSize: 18,
    fontWeight: "700",
  },
  viewAll: {
    fontSize: 14,
  },
  transaction: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionText: {
    fontWeight: "600",
    fontSize: 15,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyTransactionsContainer: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
  },
  emptyTransactionsText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
