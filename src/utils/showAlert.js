import { Alert, Platform } from "react-native";

export const showAlert = (title, message) => {
  console.log("🚀 ~ showAlert ~ Platform.OS:", Platform.OS);
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};
