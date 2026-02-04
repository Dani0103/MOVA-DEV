import { View, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../../theme/useTheme";

export default function FormInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: theme.label,
          backgroundColor: theme.inputBackground,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.label}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            color: theme.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    fontSize: 16,
  },
});
