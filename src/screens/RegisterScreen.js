import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { registerFake } from "../services/authService";
import { CURRENCIES } from "../constants/currencies";

// 🔹 Componentes reutilizables
import FormInput from "../components/form/FormInput";
import FormSelect from "../components/form/FormSelect";

export default function RegisterScreen({ navigation }) {
  // Obligatorios
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Opcionales
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("COP");

  // Monedas dinámicas
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  const { login, loading } = useAuth();

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) {
        Alert.alert("Error", "Nombre, email y contraseña son obligatorios");
        return;
      }

      const data = await registerFake({
        name,
        email,
        password,
        country,
        currency,
      });

      await login(data);
    } catch (error) {
      Alert.alert("Error", error.message);
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
              CURRENCIES[code]?.name || "Moneda desconocida"
            }`,
          }),
        );

        setCurrencies(formattedCurrencies);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las monedas");
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      {/* Nombre */}
      <Text style={styles.label}>Nombre completo</Text>
      <FormInput value={name} onChangeText={setName} />

      {/* Email */}
      <Text style={styles.label}>Correo electrónico</Text>
      <FormInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password */}
      <Text style={styles.label}>Contraseña</Text>
      <FormInput value={password} onChangeText={setPassword} secureTextEntry />

      {/* País */}
      <Text style={styles.label}>País (opcional)</Text>
      <FormInput value={country} onChangeText={setCountry} />

      {/* Moneda */}
      <Text style={styles.label}>Moneda preferida</Text>
      <FormSelect
        value={currency}
        onValueChange={setCurrency}
        items={currencies}
        loading={loadingCurrencies}
        placeholder="Selecciona una moneda"
      />

      <Button
        title={loading ? "Creando cuenta..." : "Registrarse"}
        onPress={handleRegister}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "black",
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
    color: "#fff",
  },
  label: {
    color: "#aaa",
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
