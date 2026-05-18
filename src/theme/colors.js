export const darkTheme = {
  // Fondos
  background: "#0F172A",
  card: "#1E293B",
  cardSecondary: "#334155",

  // Texto
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  // Bordes
  border: "#334155",

  // Acento / Primario
  primary: "#38BDF8",

  // Semánticos
  success: "#4ADE80",
  error: "#F87171",
  warning: "#F59E0B",

  // Inputs
  inputBackground: "#1E293B",
  label: "#94A3B8",
  placeholder: "#64748B",

  // Overlay / Modal
  overlay: "rgba(2, 6, 23, 0.85)",

  // Drawer
  drawerBackground: "#0F172A",
  drawerActive: "#1E293B",
  drawerActiveTint: "#FFFFFF",
  drawerInactiveTint: "#94A3B8",
};

export const lightTheme = {
  // Fondos
  background: "#F1F5F9",
  card: "#FFFFFF",
  cardSecondary: "#F8FAFC",

  // Texto
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Bordes
  border: "#E2E8F0",

  // Acento / Primario
  primary: "#0EA5E9",

  // Semánticos
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",

  // Inputs
  inputBackground: "#FFFFFF",
  label: "#64748B",
  placeholder: "#94A3B8",

  // Overlay / Modal
  overlay: "rgba(15, 23, 42, 0.6)",

  // Drawer
  drawerBackground: "#FFFFFF",
  drawerActive: "#EFF6FF",
  drawerActiveTint: "#0F172A",
  drawerInactiveTint: "#64748B",
};

// Retrocompatibilidad con código que importa lightColors / darkColors
export const lightColors = lightTheme;
export const darkColors = darkTheme;
