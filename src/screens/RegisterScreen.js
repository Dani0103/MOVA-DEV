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
import { Monedas, Paises, registerUser } from "../services/authService";
import { CURRENCIES } from "../constants/currencies";
import { validateRegister } from "../validators/registerValidator";
// Importamos universalAlert para consistencia
import { universalAlert } from "../utils/universalAlert";
import { parseError } from "../utils/parseError";

import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";
import { useTheme } from "../theme/useTheme";

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [moneda, setMoneda] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);

  const [loadingItems, setLoadingItems] = useState(true);
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
        setLoadingItems(true); // Asegúrate de iniciar el loading
        const resMonedas = await Monedas();
        const resPaises = await Paises();

        // Mapeo de Países: Usamos 'codigo_iso2' como el value (code)
        const formattedCountries = resPaises.data.map((pais) => ({
          code: pais.codigo_iso2,
          label: pais.nombre,
        }));

        // Mapeo de Monedas: Usamos 'codigo' como el value (code)
        const formattedCurrencies = resMonedas.data.map((moneda) => ({
          code: moneda.codigo,
          label: `${moneda.codigo} - ${moneda.nombre}`,
        }));

        setCountries(formattedCountries);
        setCurrencies(formattedCurrencies);
      } catch (error) {
        console.error(error);
        universalAlert("Error", "No se pudieron cargar los datos");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: theme.text }]}>Crea tu cuenta</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Comienza a organizar tus finanzas hoy
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre/s *</Text>
        <FormInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Apellido/s *</Text>
        <FormInput
          value={apellido}
          onChangeText={setApellido}
          placeholder="Tu apellido"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Correo electrónico *</Text>
        <FormInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ejemplo@correo.com"
          placeholderTextColor={theme.placeholder}
        />

        {/* <Text style={styles.label}>Nacionalidad *</Text>
        <FormInput
          value={nacionalidad}
          onChangeText={setNacionalidad}
          placeholder="Ej: Colombiano"
          placeholderTextColor={theme.placeholder}
        /> */}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Nacionalidad *</Text>
        <FormSelect
          value={nacionalidad}
          onValueChange={setNacionalidad}
          items={countries}
          loading={loadingItems}
          placeholder="Selecciona un pais"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Moneda preferida *</Text>
        <FormSelect
          value={moneda}
          onValueChange={setMoneda}
          items={currencies}
          loading={loadingItems}
          placeholder="Selecciona una moneda"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña *</Text>
        <FormInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="********"
          placeholderTextColor={theme.placeholder}
          rightIcon={showPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowPassword((prev) => !prev)}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmar contraseña *</Text>
        <FormInput
          value={confirmedPassword}
          onChangeText={setConfirmedPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="********"
          placeholderTextColor={theme.placeholder}
          rightIcon={showConfirmPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
        />

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: theme.primary }, submitting && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.linkContainer}
        >
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            ¿Ya tienes cuenta?{" "}
            <Text style={[styles.linkHighlight, { color: theme.primary }]}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
  },
  formSection: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase", // Toque elegante
    letterSpacing: 0.5,
  },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
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
