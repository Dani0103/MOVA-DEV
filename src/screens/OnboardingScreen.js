import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/useTheme";

const slides = [
  {
    key: "1",
    title: "Bienvenido a MOVA",
    text: "Tu dinero en movimiento, bajo tu control.\nDescubre cómo dominar tus finanzas en 3 simples pasos.",
    icon: "rocket-outline",
    color: "#38BDF8",
  },
  {
    key: "2",
    title: "Paso 1: Tus Cuentas",
    text: "Piensa en las cuentas como tus billeteras reales, tu banco o tu efectivo. Necesitas al menos una para guardar tu dinero.",
    icon: "wallet-outline",
    color: "#4ADE80",
  },
  {
    key: "3",
    title: "Paso 2: Categorías",
    text: 'Crea etiquetas (como "Alimentación" o "Salario") para saber exactamente de dónde viene tu dinero y a dónde va.',
    icon: "pricetags-outline",
    color: "#F87171",
  },
  {
    key: "4",
    title: "Paso 3: Movimientos",
    text: "El corazón de MOVA. Registra tus ingresos, tus gastos diarios y transferencias entre tus propias cuentas.",
    icon: "swap-vertical-outline",
    color: "#FB923C",
  },
  {
    key: "5",
    title: "El Siguiente Nivel",
    text: "Ve más allá con nuestras herramientas avanzadas: establece Metas, controla tus Deudas y visualiza todo en Estadísticas.",
    icon: "bar-chart-outline",
    color: "#A78BFA",
  },
];

export default function OnboardingScreen({ onFinish }) {
  const theme = useTheme();
  const sliderRef = React.useRef(null);

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: "transparent" }]}>
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}
        >
          <Ionicons name={item.icon} size={100} color={item.color} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.text, { color: theme.textSecondary }]}>{item.text}</Text>
      </View>
    );
  };

  // Botón Final
  const renderDoneButton = () => (
    <View style={[styles.buttonDone, { backgroundColor: theme.primary }]}>
      <Text style={[styles.buttonText, { color: theme.background }]}>Empezar</Text>
    </View>
  );

  // Botón Siguiente
  const renderNextButton = () => (
    <View style={styles.buttonNext}>
      <Text style={[styles.buttonNextText, { color: theme.primary }]}>Siguiente</Text>
    </View>
  );

  // Botón Omitir
  const renderSkipButton = () => (
    <View style={styles.buttonSkip}>
      <Text style={[styles.buttonSkipText, { color: theme.textSecondary }]}>Omitir</Text>
    </View>
  );

  return (
    // 🔹 EL SECRETO ESTÁ AQUÍ: Envolver el Slider en un View con el color de fondo oscuro
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppIntroSlider
        ref={sliderRef} // 🔹 Agregamos la referencia
        renderItem={renderItem}
        data={slides}
        onDone={onFinish}
        showSkipButton={true}
        onSkip={onFinish}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        // 🔹 BLOQUEO DE GESTOS MANUALES
        scrollEnabled={false} // Deshabilita el deslizamiento con el dedo
        dotClickEnabled={false} // Deshabilita saltar pantallas tocando los puntos
        // Estilos de los puntos
        activeDotStyle={{ backgroundColor: theme.primary, width: 10 }}
        dotStyle={{ backgroundColor: theme.cardSecondary }}
        // Optimizaciones de renderizado
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 80, // 🔹 Espacio extra abajo para que el texto no choque con los botones
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },

  // Estilos de los Botones
  buttonDone: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: "bold",
  },
  buttonNext: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  buttonNextText: {
    fontWeight: "600",
    fontSize: 16,
  },
  buttonSkip: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  buttonSkipText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
