import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { validateLogin } from "../validators/loginValidator";
import { useTheme } from "../theme/useTheme";

// Componentes reutilizables
import FormInput from "../components/form/FormInput";

// Alertas
import { showAlert } from "../utils/showAlert";
import { parseError } from "../utils/parseError";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      setSubmitting(true);

      const validationError = validateLogin({ email, password });
      if (validationError) {
        showAlert("Error", validationError);
        return;
      }

      const data = await loginUser(email, password);
      await login(data.data);
    } catch (error) {
      showAlert("Error", parseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Iniciar sesión</Text>

      {/* Email */}
      <Text style={[styles.label, { color: theme.label }]}>
        Correo electrónico
      </Text>
      <FormInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password */}
      <Text style={[styles.label, { color: theme.label }]}>Contraseña</Text>
      <FormInput value={password} onChangeText={setPassword} secureTextEntry />

      <Button
        title={submitting ? "Entrando..." : "Entrar"}
        onPress={handleLogin}
        disabled={submitting}
      />

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={[styles.link, { color: theme.link }]}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  label: {
    marginBottom: 6,
    marginTop: 8,
    fontSize: 14,
  },
  link: {
    marginTop: 16,
    textAlign: "center",
  },
});
