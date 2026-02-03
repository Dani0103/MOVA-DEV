import { View, TextInput, StyleSheet } from "react-native";

const INPUT_HEIGHT = 50;

export default function FormInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    height: INPUT_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: "black",
  },
  input: {
    color: "#fff",
    fontSize: 16,
  },
});
