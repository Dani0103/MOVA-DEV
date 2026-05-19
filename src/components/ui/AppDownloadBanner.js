/**
 * AppDownloadBanner.js
 * Banner que aparece en la parte inferior cuando el usuario abre la web
 * desde un navegador móvil (iOS o Android), invitándolo a descargar la app.
 *
 * Solo se renderiza en Platform.OS === "web" + user agent móvil.
 * Se descarta con la X y no vuelve a aparecer (localStorage).
 *
 * ⚠️  Actualiza las URLs de tiendas cuando publiques la app:
 *      STORE_LINKS.ios     → enlace App Store
 *      STORE_LINKS.android → enlace Play Store
 */

import React, { useEffect, useState } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Cambia estas URLs cuando la app esté publicada ──────────────────────────
const STORE_LINKS = {
  ios: "https://apps.apple.com/app/id000000000",
  android: "https://play.google.com/store/apps/details?id=com.mova.app",
};
// ─────────────────────────────────────────────────────────────────────────────

const DISMISSED_KEY = "mova_banner_dismissed_v1";

/** Detecta si el navegador es móvil y retorna "ios" | "android" | null */
function detectMobileOS() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
}

export default function AppDownloadBanner() {
  const [visible, setVisible] = useState(false);
  const [os, setOs] = useState(null);

  useEffect(() => {
    const mobileOS = detectMobileOS();
    if (!mobileOS) return;
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setOs(mobileOS);
        setVisible(true);
      }
    } catch {
      // localStorage bloqueado (modo privado extremo) → no mostrar
    }
  }, []);

  // Solo web + móvil
  if (!visible || Platform.OS !== "web") return null;

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* noop */ }
    setVisible(false);
  };

  const handleDownload = () => {
    const url = os === "ios" ? STORE_LINKS.ios : STORE_LINKS.android;
    Linking.openURL(url);
  };

  const isIOS = os === "ios";

  return (
    <View style={styles.banner}>
      {/* Icono de la app */}
      <View style={styles.iconWrap}>
        <Ionicons name="wallet-outline" size={28} color="#38BDF8" />
      </View>

      {/* Texto */}
      <View style={styles.info}>
        <Text style={styles.appName}>MOVA</Text>
        <Text style={styles.subtitle}>
          {isIOS ? "Disponible en App Store" : "Disponible en Play Store"}
        </Text>
      </View>

      {/* Botón descarga */}
      <TouchableOpacity
        style={styles.downloadBtn}
        onPress={handleDownload}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isIOS ? "logo-apple" : "logo-google-playstore"}
          size={13}
          color="#0F172A"
          style={{ marginRight: 5 }}
        />
        <Text style={styles.downloadText}>Descargar</Text>
      </TouchableOpacity>

      {/* Cerrar */}
      <TouchableOpacity
        onPress={handleDismiss}
        style={styles.closeBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    // position "fixed" es válido en React Native Web y hace que el banner
    // quede pegado al fondo sin afectar el layout del resto de la app.
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    zIndex: 9999,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  appName: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#38BDF8",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    flexShrink: 0,
  },
  downloadText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
