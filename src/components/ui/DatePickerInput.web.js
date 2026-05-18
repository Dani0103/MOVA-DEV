import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

/**
 * DatePickerInput — versión web.
 * Usa un <input type="date"> nativo del navegador.
 */
export default function DatePickerInput({ value, onChange }) {
  const theme = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.card }]}>
      <Ionicons name="calendar-outline" size={18} color={theme.primary} />
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: theme.text,
          fontSize: "15px",
          fontFamily: "inherit",
          cursor: "pointer",
          padding: "0 8px",
          colorScheme: "dark",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
  },
});
