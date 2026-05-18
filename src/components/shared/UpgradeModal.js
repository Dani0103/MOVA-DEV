import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";
import { useNavigation } from "@react-navigation/native";

/**
 * Modal reutilizable para bloqueos de plan.
 *
 * Props:
 *  - visible (bool)
 *  - onClose (fn)
 *  - title (string)   — ej: "Límite de cuentas alcanzado"
 *  - message (string) — descripción del bloqueo
 */
export default function UpgradeModal({ visible, onClose, title, message }) {
  const theme = useTheme();
  const navigation = useNavigation();

  const defaultTitle   = "Función del plan Pro";
  const defaultMessage = "Esta función es exclusiva de nuestro plan Pro. Mejora tu cuenta para acceder a herramientas avanzadas y tomar el control total de tus finanzas.";

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }]}>

          <View style={styles.iconWrap}>
            <Ionicons name="star" size={40} color="#F59E0B" />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {title || defaultTitle}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message || defaultMessage}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Quizás luego</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => {
                onClose();
                navigation.navigate("Planes");
              }}
            >
              <Text style={styles.upgradeBtnText}>Ver Planes</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: "center",
    borderTopWidth: 1,
  },
  iconWrap: {
    backgroundColor: "#F59E0B20",
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  upgradeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  upgradeBtnText: {
    color: "#0F172A",
    fontWeight: "bold",
    fontSize: 16,
  },
});
