import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

export default function FormInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  rightIcon,
  onRightIconPress,
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
            paddingRight: rightIcon ? 34 : 0, // ✅ espacio para icono
          },
        ]}
      />

      {rightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.icon}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon} size={20} color={theme.label} />
        </TouchableOpacity>
      )}
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
    position: "relative",
  },
  input: {
    fontSize: 16,
  },
  icon: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
