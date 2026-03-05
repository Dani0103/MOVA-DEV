import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔹 Importamos AsyncStorage
import { useAuth } from "../context/AuthContext";

import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppLayout from "../components/layout/AppLayout";
import { navigationRef } from "./RootNavigation";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null); // Estado para el tutorial

  // 🔹 Verificamos en memoria si el usuario ya vio el tutorial
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("ya_vio_tutorial");

        if (value === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    };

    if (isAuthenticated) {
      checkOnboarding();
    }
  }, [isAuthenticated]);

  // 🔹 Función para guardar que ya terminó el tutorial
  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem("ya_vio_tutorial", "true");
      setIsFirstLaunch(false); // Esto cambiará la pantalla automáticamente a MainApp
    } catch (error) {
      console.error("Error guardando el tutorial", error);
    }
  };

  // 🔹 Esperamos a que cargue tanto el AuthContext como la validación de AsyncStorage
  if (loading || isFirstLaunch === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0F172A",
        }}
      >
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // 🔴 ESTADO 1: Usuario NO logueado
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : isFirstLaunch ? (
          // 🟡 ESTADO 2: Usuario logueado + Primera vez en la app
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen {...props} onFinish={handleOnboardingFinish} />
            )}
          </Stack.Screen>
        ) : (
          // 🟢 ESTADO 3: Usuario logueado + Ya pasó el tutorial
          <Stack.Screen name="MainApp" component={AppLayout} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
