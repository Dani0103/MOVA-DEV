import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/useTheme";
import { forgotPassword } from "../services/authService";
import { universalAlert } from "../utils/universalAlert";

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      universalAlert("Email inválido", "Ingresa un email válido.");
      return;
    }
    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e) {
      universalAlert(
        "Error",
        e.message || "No se pudo enviar el enlace de recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={[styles.iconWrap, { backgroundColor: theme.card }]}>
          <Ionicons
            name={sent ? "mail-open-outline" : "lock-closed-outline"}
            size={48}
            color={theme.primary}
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          {sent ? "¡Revisa tu correo!" : "¿Olvidaste tu contraseña?"}
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {sent
            ? `Si el correo está registrado, recibirás un enlace para crear una nueva contraseña en ${email}.`
            : "Te enviaremos un enlace al correo registrado para restablecer tu contraseña."}
        </Text>

        {!sent && (
          <>
            <View style={[styles.inputWrap, { backgroundColor: theme.card }]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={theme.textMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="tu@correo.com"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary },
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: theme.background }]}>
                  Enviar enlace
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {sent && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.primaryBtnText, { color: theme.background }]}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() =>
            sent
              ? navigation.navigate("ResetPassword", { email })
              : navigation.navigate("ResetPassword", { email })
          }
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            ¿Ya tienes un código? <Text style={{ color: theme.primary, fontWeight: "700" }}>Ingrésalo aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 12,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },
  linkBtn: { paddingVertical: 8, alignItems: "center" },
  linkText: { fontSize: 13 },
});
