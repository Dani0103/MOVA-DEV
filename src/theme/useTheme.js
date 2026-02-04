import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "./colors";

export function useTheme() {
  const scheme = useColorScheme();
  console.log("🚀 ~ useTheme ~ scheme:", scheme);
  return scheme === "dark" ? darkColors : lightColors;
}
