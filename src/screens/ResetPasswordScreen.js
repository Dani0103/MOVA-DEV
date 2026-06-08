import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/useTheme";
import { resetPassword } from "../services/authService";
import { universalAlert } from "../utils/universalAlert";

export default function ResetPasswordScreen({ navigation, route }) {
  const theme = useTheme();
  const initialEmail = route?.params?.email ?? "";

  const [token, setToken] = useState(route?.params?.token ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim()) {
      universalAlert("Falta el código", "Ingresa el código que recibiste en el correo.");
      return;
    }
    if (!email.includes("@")) {
      universalAlert("Email inválido", "Ingresa el email asociado a la cuenta.");
      return;
    }
    if (password.length < 8) {
      universalAlert(
        "Contraseña corta",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }
    if (password !== confirm) {
      universalAlert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        token: token.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: confirm,
      });
      universalAlert(
        "¡Contraseña restablecida!",
        "Ya puedes iniciar sesión con tu nueva contraseña.",
        [{ text: "Iniciar sesión", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      universalAlert(
        "Error",
        e.message || "No se pudo restablecer la contraseña. Verifica el código."
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={[styles.iconWrap, { backgroundColor: theme.card }]}>
          <Ionicons name="key-outline" size={48} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Restablecer contraseña
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Pega el código que recibiste por correo y define tu nueva contraseña.
        </Text>

        {/* Email */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card }]}>
          <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="tu@correo.com"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Token */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Código de recuperación</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card }]}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Pega aquí el código"
            placeholderTextColor={theme.textMuted}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
        </View>

        {/* Nueva contraseña */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nueva contraseña</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card }]}>
          <Ionicons name="key-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Confirmar */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmar contraseña</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card }]}>
          <Ionicons name="key-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor={theme.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPass}
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
              Cambiar contraseña
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            ¿No recibiste el código? <Text style={{ color: theme.primary, fontWeight: "700" }}>Reenviar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 12,
    zIndex: 10,
  },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15 },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },
  linkBtn: { paddingVertical: 8, alignItems: "center" },
  linkText: { fontSize: 13 },
});
