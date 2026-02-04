import { View, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../theme/useTheme";

export default function FormSelect({
  value,
  onValueChange,
  items = [],
  loading = false,
  placeholder = "Seleccionar",
}) {
  const theme = useTheme();

  const isPlaceholder = !value;

  return (
    <View
      style={[
        styles.pickerContainer,
        {
          borderColor: theme.label,
          backgroundColor: theme.inputBackground,
        },
      ]}
    >
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[
          styles.picker,
          {
            color: isPlaceholder ? theme.label : theme.text,
            backgroundColor: theme.inputBackground,
          },
        ]}
        dropdownIconColor={theme.text}
      >
        {/* Placeholder visible */}
        <Picker.Item label={placeholder} value="" />

        {loading ? (
          <Picker.Item label="Cargando..." value="__loading" />
        ) : (
          items.map((item) => (
            <Picker.Item key={item.code} label={item.label} value={item.code} />
          ))
        )}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    marginBottom: 14,
    height: 40,
    justifyContent: "center",
  },
  picker: {
    height: 40,
  },
});
