import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { validateLogin } from "../validators/loginValidator";
import { universalAlert } from "../utils/universalAlert";
import { parseError } from "../utils/parseError";
import FormInput from "../components/form/FormInput";
import { useTheme } from "../theme/useTheme";

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Estado para controlar si la contraseña es visible o no
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  let device_name = Platform.OS;

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      const validationError = validateLogin({ email, password });
      if (validationError) {
        universalAlert("Error", validationError);
        return;
      }

      const data = await loginUser(email, password, device_name);
      await login(data.data);
    } catch (error) {
      console.log("🚀 ~ handleLogin ~ error:", error);

      // Variable por defecto
      let mensajeMostrar = "Ocurrió un error al iniciar sesión.";

      // Verificamos si vienen errores de validación (422) desde Laravel
      if (error.errors) {
        if (error.errors.email) {
          mensajeMostrar = error.errors.email[0]; // "El usuario no existe..."
        } else if (error.errors.password) {
          mensajeMostrar = error.errors.password[0];
        }
      } else if (error.message) {
        // Si no hay array de errores, mostramos el mensaje general ("Los datos enviados no son validos.")
        mensajeMostrar = error.message;
      }

      // Mostramos la alerta con el texto limpio
      universalAlert("Error", mensajeMostrar);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: theme.text }]}>Bienvenido</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Inicia sesión para continuar</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Correo electrónico</Text>
        <FormInput
          placeholder="ejemplo@correo.com"
          placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña</Text>
        {/* 🔹 Agregamos props para el icono y la visibilidad */}
        <FormInput
          placeholder="********"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // Si showPassword es false, se oculta
          rightIcon={showPassword ? "eye-off" : "eye"} // Cambia el icono dinámicamente
          onRightIconPress={() => setShowPassword(!showPassword)} // Alterna el estado
        />

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.linkContainer}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            ¿Olvidaste tu contraseña?{" "}
            <Text style={[styles.linkHighlight, { color: theme.primary }]}>
              Recupérala
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.linkContainer}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            ¿No tienes cuenta?{" "}
            <Text style={[styles.linkHighlight, { color: theme.primary }]}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  formSection: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
  },
  linkHighlight: {
    fontWeight: "bold",
  },
});
