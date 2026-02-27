import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import { CURRENCIES } from "../constants/currencies";
import { validateRegister } from "../validators/registerValidator";
// Importamos universalAlert para consistencia
import { universalAlert } from "../utils/universalAlert";
import { parseError } from "../utils/parseError";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [moneda, setMoneda] = useState("COP");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  let device_name = Platform.OS;

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
        universalAlert("Error", validationError);
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
        device_name,
      });

      await login(data.data);
    } catch (error) {
      universalAlert("Error", parseError(error.message));
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
        if (data.result !== "success")
          throw new Error("Error cargando monedas");

        const formattedCurrencies = Object.keys(data.conversion_rates).map(
          (code) => ({
            code,
            label: `${code} - ${CURRENCIES[code]?.name || "Moneda por definir"}`,
          }),
        );
        setCurrencies(formattedCurrencies);
      } catch (error) {
        universalAlert("Error", "No se pudieron cargar las monedas");
      } finally {
        setLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Comienza a organizar tus finanzas hoy
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Nombre/s *</Text>
        <FormInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Apellido/s *</Text>
        <FormInput
          value={apellido}
          onChangeText={setApellido}
          placeholder="Tu apellido"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Correo electrónico *</Text>
        <FormInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Nacionalidad *</Text>
        <FormInput
          value={nacionalidad}
          onChangeText={setNacionalidad}
          placeholder="Ej: Colombiano"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Moneda preferida *</Text>
        <FormSelect
          value={moneda}
          onValueChange={setMoneda}
          items={currencies}
          loading={loadingCurrencies}
          placeholder="Selecciona una moneda"
        />

        <Text style={styles.label}>Contraseña *</Text>
        <FormInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="********"
          placeholderTextColor="#64748B"
          rightIcon={showPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowPassword((prev) => !prev)}
        />

        <Text style={styles.label}>Confirmar contraseña *</Text>
        <FormInput
          value={confirmedPassword}
          onChangeText={setConfirmedPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="********"
          placeholderTextColor="#64748B"
          rightIcon={showConfirmPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
        />

        <TouchableOpacity
          style={[styles.mainButton, submitting && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.linkHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60, // Espacio para el notch o aire superior
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    marginTop: 6,
  },
  formSection: {
    width: "100%",
  },
  label: {
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase", // Toque elegante
    letterSpacing: 0.5,
  },
  mainButton: {
    backgroundColor: "#38BDF8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  linkText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  linkHighlight: {
    color: "#38BDF8",
    fontWeight: "bold",
  },
});
