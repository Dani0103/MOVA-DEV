import { Alert, Platform } from "react-native";

export const universalAlert = (title, message, buttons = []) => {
  if (Platform.OS === "web") {
    // 1. Si no hay botones, es un alert simple
    if (buttons.length === 0) {
      alert(`${title}\n\n${message}`);
      return;
    }

    // 2. Si hay botones, buscamos el de acción (que no sea 'cancel')
    const confirmButton = buttons.find((b) => b.style !== "cancel");
    const cancelButton = buttons.find((b) => b.style === "cancel");

    // Usamos el confirm del navegador
    const result = window.confirm(`${title}\n\n${message}`);

    if (result) {
      if (confirmButton && confirmButton.onPress) confirmButton.onPress();
    } else {
      if (cancelButton && cancelButton.onPress) cancelButton.onPress();
    }
  } else {
    // En Móvil: El Alert nativo ya maneja el arreglo de botones perfectamente
    // Si pasaste botones, úsalos. Si no, pon el OK por defecto.
    const finalButtons = buttons.length > 0 ? buttons : [{ text: "OK" }];

    Alert.alert(title, message, finalButtons);
  }
};
