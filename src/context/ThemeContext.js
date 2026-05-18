import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "../theme/colors";
import { storage } from "../utils/storage";

const THEME_KEY = "app_theme";

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true); // oscuro por defecto

  useEffect(() => {
    storage.get(THEME_KEY).then((saved) => {
      if (saved === "light") setIsDark(false);
      else if (saved === "dark") setIsDark(true);
      else setIsDark(systemScheme !== "light");
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await storage.set(THEME_KEY, next ? "dark" : "light");
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
