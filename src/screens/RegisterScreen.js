import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import { CURRENCIES } from "../constants/currencies";
import { validateRegister } from "../validators/registerValidator";
import { useTheme } from "../theme/useTheme";

// 🔹 Componentes reutilizables
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";

//Alertas
import { showAlert } from "../utils/showAlert";
import { parseError } from "../utils/parseError";

export default function RegisterScreen({ navigation }) {
  // Obligatorios
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [moneda, setMoneda] = useState("COP");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  // Monedas dinámicas
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const theme = useTheme();

  const handleRegister = async () => {
    try {
      setSubmitting(true);

      const validationError = validateRegister({
        nombre,
        apellido,
        email,
        nacionalidad,
        moneda,
        password,
        confirmedPassword,
      });

      if (validationError) {
        showAlert("Error", validationError);
        return;
      }

      const data = await registerUser({
        nombre,
        apellido,
        email,
        nacionalidad,
        moneda,
        password,
        confirmedPassword,
      });

      await login(data);
    } catch (error) {
      showAlert("Error", parseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          "https://v6.exchangerate-api.com/v6/b27e1c7bfcca2c10dca98e5c/latest/USD",
        );
        const data = await response.json();

        if (data.result !== "success") {
          throw new Error("Error cargando monedas");
        }

        const formattedCurrencies = Object.keys(data.conversion_rates).map(
          (code) => ({
            code,
            label: `${code} - ${
              CURRENCIES[code]?.name || "Moneda por definir"
            }`,
          }),
        );

        setCurrencies(formattedCurrencies);
      } catch (error) {
        showAlert("Error", "No se pudieron cargar las monedas");
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>

      {/* Nombres*/}
      <Text style={[styles.label, { color: theme.label }]}>Nombre/s *</Text>
      <FormInput value={nombre} onChangeText={setNombre} />

      {/* Apellidos */}
      <Text style={[styles.label, { color: theme.label }]}>Apellido/s *</Text>
      <FormInput value={apellido} onChangeText={setApellido} />

      {/* Email */}
      <Text style={[styles.label, { color: theme.label }]}>
        Correo electrónico *
      </Text>
      <FormInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* País */}
      <Text style={[styles.label, { color: theme.label }]}>Nacionalidad *</Text>
      <FormInput value={nacionalidad} onChangeText={setNacionalidad} />

      {/* Moneda */}
      <Text style={[styles.label, { color: theme.label }]}>
        Moneda preferida *
      </Text>
      <FormSelect
        value={moneda}
        onValueChange={setMoneda}
        items={currencies}
        loading={loadingCurrencies}
        placeholder="Selecciona una moneda"
      />

      {/* Password */}
      <Text style={[styles.label, { color: theme.label }]}>Contraseña *</Text>
      <FormInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightIcon={showPassword ? "eye-off" : "eye"}
        onRightIconPress={() => setShowPassword((prev) => !prev)}
      />

      {/* confirmacion Password */}
      <Text style={[styles.label, { color: theme.label }]}>
        Confirmar contraseña *
      </Text>
      <FormInput
        value={confirmedPassword}
        onChangeText={setConfirmedPassword}
        secureTextEntry={!showConfirmPassword}
        rightIcon={showConfirmPassword ? "eye-off" : "eye"}
        onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
      />

      <Button
        title={submitting ? "Creando cuenta..." : "Registrarse"}
        onPress={handleRegister}
        disabled={submitting}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        disabled={submitting}
      >
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "statrt",
    padding: 24,
    overflow: "auto",
  },
  title: {
    fontSize: 26,
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
    color: "#60a5fa",
  },
});
