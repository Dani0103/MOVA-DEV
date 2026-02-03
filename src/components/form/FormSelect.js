import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

// const INPUT_HEIGHT = 50;

export default function FormSelect({
  value,
  onValueChange,
  items = [],
  loading = false,
  placeholder = "Seleccionar",
}) {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor="#fff"
      >
        {loading ? (
          <Picker.Item label="Cargando monedas..." value="" />
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
    borderColor: "#444",
    borderRadius: 8,
    marginBottom: 14,
    height: 50,
    justifyContent: "center",
  },
  picker: {
    color: "#fff",
    borderRadius: 8,
    backgroundColor: "black",
    height: 50,
  },
});
